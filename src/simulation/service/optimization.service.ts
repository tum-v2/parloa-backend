import { SimulationDocument } from '@db/models/simulation.model';
import repositoryFactory from '@db/repositories/factory';
import { AgentDocument } from '@db/models/agent.model';
import { OptimizationDocument } from '@db/models/optimization.model';

import { RunSimulationRequest } from '@simulation/model/request/simulation.request';
import simulationService from '@simulation/service/simulation.service';
import conversationService from '@simulation/service/conversation.service';

import { LLMModel } from '@enums/llm-model.enum';
import { SimulationType } from '@enums/simulation-type.enum';

import { OpenAI } from 'langchain/llms/openai';
import { PromptTemplate } from 'langchain/prompts';
import { CommaSeparatedListOutputParser } from 'langchain/output_parsers';
import { RunnableSequence } from 'langchain/schema/runnable';

const NUMBER_OF_PROMPTS: number = 4;

const optimizationRepository = repositoryFactory.optimizationRepository;

/**
 * Generate a predetermined number of prompts using the original prompt.
 * @param agent - the template that we will use for speaking with the LLM.
 * @returns string[] Returns an array of strings, containing new prompts.
 */
async function generatePrompts(agent: AgentDocument): Promise<string[]> {
  console.log('Prompt generation started.');

  if (agent.llm === LLMModel.FAKE) {
    console.log('Fake LLM, skipping prompt generation.');

    return [
      'From Munich, I want to fly to Berlin',
      'I would like to fly from Munich to Berlin',
      'I want to buy tickets from Munich to Berlin',
      'I need tickets from Munich to Berlin',
    ];
  }

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
  console.log('Configuration:', request);

  // Check if the service agent config is defined
  if (request.serviceAgentConfig === undefined) {
    throw new Error('Service agent config not found');
  }

  // Chat with the LLM and generate 4 different prompts, also include the original prompt
  const prompts = await generatePrompts(request.serviceAgentConfig);

  // Create a database entry for the current optimization
  const optimizationDocument: OptimizationDocument = await optimizationRepository.create({ simulations: [] });
  const optimizationId = optimizationDocument._id;

  // Call initiate for the base simulation and save it to the db
  const simulation: SimulationDocument = await simulationService.initiate(request, optimizationId, false);
  optimizationDocument.baseSimulation = simulation._id;
  await optimizationDocument.save();

  for (const prompt of prompts) {
    //TODO Create a template for every prompt in the database until we figure out what to do.
    const agentConfig = {
      name: request.serviceAgentConfig.name,
      domain: request.serviceAgentConfig.domain,
      llm: request.serviceAgentConfig.llm,
      temperature: request.serviceAgentConfig.temperature,
      maxTokens: request.serviceAgentConfig.maxTokens,
      prompt: prompt,
    };

    const simulationConfig = {
      scenario: request.scenario,
      type: SimulationType.OPTIMIZATION,
      name: request.name,
      description: request.description,
      numConversations: request.numConversations,
      serviceAgentConfig: agentConfig,
      userAgentConfig: request.userAgentConfig,
    };

    const newRequest: RunSimulationRequest = simulationConfig as RunSimulationRequest;

    // start the simulation for one of the prompts
    const simulation: SimulationDocument = await simulationService.initiate(newRequest, optimizationId, true);

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
  console.log('Simulation over, received optimization ID:', optimization);
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
