import { SimulationDocument } from '../db/models/simulation.model';
import { RunSimulationRequest } from '../model/request/run-simulation.request';
import simulationService from './simulation.service';
import conversationService from './conversation.service';
import repositoryFactory from '../db/repositories/factory';
import { AgentDocument } from '../db/models/agent.model';
import agentService from './agent.service';
import { OptimizationDocument } from '@simulation/db/models/optimization.model';
import { SimulationScenario, SimulationType } from '@simulation/db/enum/enums';
import { OpenAI } from 'langchain/llms/openai';
import { PromptTemplate } from 'langchain/prompts';
import { CommaSeparatedListOutputParser } from 'langchain/output_parsers';
import { RunnableSequence } from 'langchain/dist/schema/runnable';

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

  const serviceAgent: AgentDocument | null = await agentRepository.getById(<string>request.serviceAgentId);

  if (serviceAgent === null) {
    throw new Error('Service agent id not found');
  }

  // Chat with the LLM and generate 4 different prompts, also include the original prompt
  const prompts = await generatePrompts(serviceAgent);

  // Create a database entry for the current optimization
  const optimizationDocument: OptimizationDocument = await optimizationRepository.create({ simulations: [] });
  const optimizationId = optimizationDocument._id;

  // Call initiate for the base simulation and save it to the db
  const simulation: SimulationDocument = await simulationService.initiate(request, optimizationId, false);
  optimizationDocument.baseSimulation = simulation._id;
  await optimizationDocument.save();

  for (const prompt of prompts) {
    //TODO Create a template for every prompt in the database until we figure out what to do.
    const agent: AgentDocument = await agentService.create({ prompt: prompt });
    const newRequest: RunSimulationRequest = {
      scenario: SimulationScenario,
      type: SimulationType.OPTIMIZATION,
      name: request.name,
      description: request.description,
      numConversations: request.numConversations,
      serviceAgentId: agent._id,
      userAgentId: request.userAgentId,
    };
    // start the simulation for one of the prompts
    const simulation: SimulationDocument = await simulationService.initiate(newRequest, optimizationId, true);

    // Add the ongoing simulationId to the database, under its related optimizationId
    await optimizationRepository.addSimulationId(optimizationId, simulation._id);
  }

  return optimizationDocument;
}

export default {
  initiate,
};
