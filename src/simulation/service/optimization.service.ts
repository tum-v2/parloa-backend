import { SimulationDocument } from '../db/models/simulation.model';
import { RunSimulationRequest } from '../model/request/simulation.request';
import simulationService from './simulation.service';
import conversationService from './conversation.service';
import repositoryFactory from '../db/repositories/factory';
import { AgentDocument } from '../db/models/agent.model';
import agentService from './agent.service';
import { OptimizationDocument } from '@simulation/db/models/optimization.model';
import { SimulationType } from '@simulation/db/enum/enums';
import { OpenAI } from 'langchain/llms/openai';
import { PromptTemplate } from 'langchain/prompts';
import { CommaSeparatedListOutputParser } from 'langchain/output_parsers';
import { RunnableSequence } from 'langchain/schema/runnable';

const NUMBER_OF_PROMPTS: number = 4;

const agentRepository = repositoryFactory.agentRepository;
const optimizationRepository = repositoryFactory.optimizationRepository;

/**
 * Generate a predetermined number of prompts using the original prompt.
 * @param agent - the template that we will use for speaking with the LLM.
 * @returns string[] Returns an array of strings, containing new prompts.
 */
async function generatePrompts(agent: AgentDocument): Promise<string[]> {
  console.log('Prompt generation started.');

  // Set up the parser and the config, parser makes sure the result will be a comma seperated list.
  const parser = new CommaSeparatedListOutputParser();
  const azureOpenAIInput = conversationService.setModelConfig(agent.llm, agent.temperature, agent.maxTokens);

  const chain = RunnableSequence.from([
    PromptTemplate.fromTemplate(
      'From this prompt: {prompt}, generate {promptNumber} new prompts with same context and meaning but with different grammar and syntax.\n{format_instructions}',
    ),
    new OpenAI(azureOpenAIInput),
    parser,
  ]);

  // Returns a comma seperated list of new prompts

  return await chain.invoke({
    prompt: agent.prompt,
    promptNumber: NUMBER_OF_PROMPTS.toString(),
    format_instructions: parser.getFormatInstructions(),
  });
}

/**
 * Creates a simulation object and initiates the simulation.
 * @param request - The simulation configuration.
 * @returns A promise that resolves to the simulation object.
 * @throws Throws an error if there is an issue with the MongoDB query.
 */
async function initiate(request: RunSimulationRequest): Promise<OptimizationDocument> {
  console.log('Optimization initiated...');

  const serviceAgent: AgentDocument | null = await agentRepository.getById(request.serviceAgentId!);

  if (serviceAgent === null) {
    throw new Error('Service agent id not found');
  }

  // Chat with the LLM and generate 4 different prompts, also include the original prompt
  const prompts = await generatePrompts(serviceAgent);

  // Create a database entry for the current optimization
  const optimizationDocument: OptimizationDocument = await optimizationRepository.create({ simulations: [] });
  const optimizationId = optimizationDocument._id;

  // Also create an entry in the dictionary, so we can keep track of when an optimization ends
  if (!(optimizationId in optimizationDictionary)) {
    optimizationDictionary[optimizationId] = NUMBER_OF_PROMPTS + 1;
  }

  // Call initiate for the base simulation and save it to the db
  const simulation: SimulationDocument = await simulationService.initiate(request);
  optimizationDocument.baseSimulation = simulation._id;
  await optimizationDocument.save();

  for (const prompt of prompts) {
    //TODO Create a template for every prompt in the database until we figure out what to do.
    const agent: AgentDocument = await agentService.create({ prompt: prompt });
    const newRequest: RunSimulationRequest = {
      scenario: request.scenario,
      type: SimulationType.OPTIMIZATION,
      name: request.name,
      description: request.description,
      numConversations: request.numConversations,
      serviceAgentId: agent._id,
      userAgentId: request.userAgentId,
      serviceAgentConfig: agent,
      userAgentConfig: request.userAgentConfig,
    };
    // start the simulation for one of the prompts
    const simulation: SimulationDocument = await simulationService.initiate(newRequest);

    // Add the ongoing simulationId to the database, under its related optimizationId
    await optimizationRepository.addSimulationId(optimizationId, simulation._id);
  }

  return optimizationDocument;
}

/**
 * This function gets called by the Simulation team whenever a simulation is completed.
 * @param optimization - The ID of the optimization session that the simulation belongs to.
 */
async function handleSimulationOver(optimization: string) {
  // check if optimizationId exists in the optimization dictionary
  if (!(optimization in optimizationDictionary)) {
    throw new Error('Optimization ID does not exist! ');
  }

  // Decrease the counter that corresponds to the optimization ID by 1, if it becomes 0, it means the optimization ended.
  optimizationDictionary[optimization] = -1;

  if (optimizationDictionary[optimization] == 0) {
    //TODO optimization ended, call anything here - for further implementation!
  }
}

/**
 * Retrieves children simulations for a given optimization.
 * @param optimization - The optimization to retrieve children simulations for.
 * @returns A promise that resolves to an array of SimulationDocument objects.
 */
function getSimulations(optimization: string): Promise<SimulationDocument[] | null> {
  return optimizationRepository.getSimulationsFromOptimization(optimization);
}

export default {
  initiate,
  handleSimulationOver,
  getSimulations,
};
