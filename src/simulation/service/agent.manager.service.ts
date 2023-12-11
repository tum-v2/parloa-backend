import { AgentDocument } from '@db/models/agent.model';
import { CustomAgent, MsgHistoryItem } from '@simulation/agents/custom.agent';
import { configureServiceAgent, setupPath } from '@simulation/service/conversation.service';

/**
 * Manages agents for different simulations, allowing multiple chats with different agents.
 */
class AgentManager {
  // Map to store agents with chatId as the key
  public agents: Map<string, CustomAgent> = new Map();

  // Map to store message count for each agent
  public messageCounts: Map<string, number> = new Map();

  /**
   * Create a new agent for a simulation or return the existing agent if already created.
   * @param chatId - ID of the chat.
   * @param serviceAgentModel - Agent model used for creating the agent.
   * @param messageHistory - Optional message history for initializing the agent.
   * @returns A Promise that resolves to the created or existing agent.
   */
  async createAgent(
    chatId: string,
    serviceAgentModel: AgentDocument,
    messageHistory?: MsgHistoryItem[],
  ): Promise<CustomAgent> {
    setupPath();

    if (!this.agents.has(chatId)) {
      const newAgent = await configureServiceAgent(serviceAgentModel, messageHistory);
      this.agents.set(chatId, newAgent);
      this.messageCounts.set(chatId, 0);
    }

    return this.agents.get(chatId)!;
  }

  /**
   * Get the agent associated with the current simulation.
   * @param chatId - ID of the chat.
   * @returns The agent for the current simulation or null if none found.
   */
  getCurrentAgent(chatId: string): CustomAgent | null {
    return this.agents.get(chatId) || null;
  }

  /**
   * Get the agent associated with a specific simulation.
   * @param chatId - ID of the chat.
   * @returns The agent for the specified simulation or null if none found.
   */
  getAgentByConversation(chatId: string): CustomAgent | null {
    return this.agents.get(chatId) || null;
  }

  /**
   * Increment the message count for the current agent
   * @param chatId - ID of the chat.
   */
  incrementMessageCountForCurrentAgent(chatId: string) {
    if (this.agents.has(chatId)) {
      const currentCount = this.messageCounts.get(chatId) || 0;
      this.messageCounts.set(chatId, currentCount + 1);
    }
  }

  /**
   * Load the message count for the current agent based on its message history.
   * @param chatId - ID of the chat.
   */
  loadMessageCountForCurrentAgent(chatId: string) {
    const agent = this.getCurrentAgent(chatId);
    if (this.agents.has(chatId)) {
      if (agent) {
        this.messageCounts.set(chatId, agent.messageHistory.length);
      }
    }
  }

  /**
   * Get the message count for the current agent's simulation.
   * @param chatId - ID of the chat.
   * @returns The message count for the current agent's simulation.
   */
  getMessageCountForCurrentAgent(chatId: string): number {
    return this.messageCounts.get(chatId) || 0;
  }
}

export default AgentManager;
