import { SimulationDocument } from '../db/models/simulation.model';
import { RunSimulationRequest } from '../model/request/run-simulation.request';
import simulationService from './simulation.service';
import conversationService from './conversation.service';
import repositoryFactory from '../db/repositories/factory';
import { AgentDocument } from '../db/models/agent.model';
import agentService from './agent.service';
import { OptimizationDocument } from '@simulation/db/models/optimization.model';
import { ConversationType, SimulationScenario } from '@simulation/db/enum/enums';
import { OpenAI } from 'langchain/llms/openai';
import { PromptTemplate } from 'langchain/prompts';
import { CommaSeparatedListOutputParser } from 'langchain/output_parsers';
import { RunnableSequence } from 'langchain/dist/schema/runnable';


const NUMBER_OF_PROMPTS: number = 4;

const agentRepository = repositoryFactory.agentRepository;


/**
 * Generate a predetermined number of prompts using the original prompt.
 * @param agent - the template that we will use for speaking with the LLM.
 * @returns string[] Returns an array of strings, containing new prompts.
 */
async function generatePrompts(agent: AgentDocument) : Promise<string[]> {
  console.log("Prompt generation started.");

  // Set up the parser and the config, parser makes sure the result will be a comma seperated list.
  const parser = new CommaSeparatedListOutputParser();
  const azureOpenAIInput = conversationService.setModelConfig(agent.llm, agent.temperature, agent.maxTokens);


  const chain = RunnableSequence.from([
    PromptTemplate.fromTemplate('From this prompt: {prompt}, generate {promptNumber} new prompts with same context and meaning but with different grammar and syntax.\n{format_instructions}'),
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

  const serviceAgent: AgentDocument | null = await agentRepository.getById(request.serviceAgentConfig);

  if (serviceAgent === null) {
    throw new Error('Service agent id not found');
  }

  const originalPrompt: string = serviceAgent.prompt;

  // Chat with the LLM and generate 4 different prompts, also include the original prompt
  let prompts: string[] = [];
  prompts = await generatePrompts(serviceAgent);
  prompts.push(originalPrompt);

  //TODO Hold Simulation requests and Simulation documents for each prompt until we decide what to do in terms of database
  const requests: RunSimulationRequest[] = [];
  const simulations: SimulationDocument[] = [];


  for (const prompt of prompts) {
    //TODO Create a template for every prompt in the database until we figure out what to do.
    const agent: AgentDocument = await agentService.create({ prompt: prompt });
    const newRequest : RunSimulationRequest = {
      scenario: SimulationScenario,
      type: ConversationType,
      name: request.name,
      numConversations: request.numConversations,
      serviceAgentConfig: agent._id,
      userAgentConfig: request.userAgentConfig,

    }
    const simulation:SimulationDocument = await simulationService.initiate(newRequest);

    requests.push(newRequest);
    simulations.push(simulation);
  }

  return simulation;
}


export default {
  initiate
};
