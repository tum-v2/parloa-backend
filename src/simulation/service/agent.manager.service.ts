import { AgentDocument } from '@db/models/agent.model';
import { CustomAgent, MsgHistoryItem } from '@simulation/agents/custom.agent';
import { configureServiceAgent, setupPath } from '@simulation/service/conversation.service';

/**
 * Manages agents for different simulations, allowing multiple chats with different agents.
 */
class AgentManager {
  // Map to store agents with simulationId as the key
  public agents: Map<string, CustomAgent> = new Map();

  // Current simulation associated with the agent
  public currentSimulation: string | null = null;

  // Map to store message count for each agent
  public messageCounts: Map<string, number> = new Map();

  /**
   * Create a new agent for a simulation or return the existing agent if already created.
   * @param simulationId - ID of the simulation/chat.
   * @param serviceAgentModel - Agent model used for creating the agent.
   * @param messageHistory - Optional message history for initializing the agent.
   * @returns A Promise that resolves to the created or existing agent.
   */
  async createAgent(
    simulationId: string,
    serviceAgentModel: AgentDocument,
    messageHistory?: MsgHistoryItem[],
  ): Promise<CustomAgent> {
    setupPath();

    if (!this.agents.has(simulationId)) {
      const newAgent = await configureServiceAgent(serviceAgentModel, messageHistory);
      this.agents.set(simulationId, newAgent);
      this.messageCounts.set(simulationId, 0);
    }

    return this.agents.get(simulationId)!;
  }

  /**
   * Set the current simulation associated with the agent.
   * @param simulationId - ID of the simulation/chat.
   * @throws Error if the agent with the specified simulation ID does not exist.
   */
  setCurrentAgent(simulationId: string): void {
    if (this.agents.has(simulationId)) {
      this.currentSimulation = simulationId;
    } else {
      throw new Error(`Agent with Simulation ID ${simulationId} does not exist.`);
    }
  }

  /**
   * Get the agent associated with the current simulation.
   * @returns The agent for the current simulation or null if none found.
   */
  getCurrentAgent(): CustomAgent | null {
    return this.currentSimulation ? this.agents.get(this.currentSimulation) || null : null;
  }

  /**
   * Get the agent associated with a specific simulation.
   * @param simulationId - ID of the simulation/chat.
   * @returns The agent for the specified simulation or null if none found.
   */
  getAgentBySimulation(simulationId: string): CustomAgent | null {
    return this.agents.get(simulationId) || null;
  }

  /**
   * Increment the message count for the current agent
   */
  incrementMessageCountForCurrentAgent() {
    const currentSimulation = this.currentSimulation;
    if (currentSimulation && this.agents.has(currentSimulation)) {
      const currentCount = this.messageCounts.get(currentSimulation) || 0;
      this.messageCounts.set(currentSimulation, currentCount + 1);
    }
  }

  /**
   * Load the message count for the current agent based on its message history.
   */
  loadMessageCountForCurrentAgent() {
    const currentSimulation = this.currentSimulation;
    const agent = this.getCurrentAgent();
    if (currentSimulation && this.agents.has(currentSimulation)) {
      if (agent) {
        this.messageCounts.set(currentSimulation, agent.messageHistory.length);
      }
    }
  }

  /**
   * Get the message count for the current agent's simulation.
   * @returns The message count for the current agent's simulation.
   */
  getMessageCountForCurrentAgent(): number {
    const currentSimulation = this.currentSimulation;
    return currentSimulation ? this.messageCounts.get(currentSimulation) || 0 : 0;
  }
}

export default AgentManager;
