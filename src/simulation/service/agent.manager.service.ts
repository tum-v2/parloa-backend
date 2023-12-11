import { AgentDocument } from '@db/models/agent.model';
import { CustomAgent, MsgHistoryItem } from '@simulation/agents/custom.agent';
import { configureServiceAgent, setupPath } from '@simulation/service/conversation.service';

/**
 * Manages agents for different conversations, allowing multiple chats with different agents.
 */
class AgentManager {
  // Map to store agents with conversationId as the key
  public agents: Map<string, CustomAgent> = new Map();

  // Map to store message count for each agent
  public messageCounts: Map<string, number> = new Map();

  /**
   * Create a new agent for a conversation or return the existing agent if already created.
   * @param conversationId - ID of the chat.
   * @param serviceAgentModel - Agent model used for creating the agent.
   * @param messageHistory - Optional message history for initializing the agent.
   * @returns A Promise that resolves to the created or existing agent.
   */
  async createAgent(
    conversationId: string,
    serviceAgentModel: AgentDocument,
    messageHistory?: MsgHistoryItem[],
  ): Promise<CustomAgent> {
    setupPath();

    if (!this.agents.has(conversationId)) {
      const newAgent = await configureServiceAgent(serviceAgentModel, messageHistory);
      this.agents.set(conversationId, newAgent);
      this.messageCounts.set(conversationId, 0);
    }

    return this.agents.get(conversationId)!;
  }

  /**
   * Get the agent associated with the current conversation.
   * @param conversationId - ID of the chat.
   * @returns The agent for the current conversation or null if none found.
   */
  getCurrentAgent(conversationId: string): CustomAgent | null {
    return this.agents.get(conversationId) || null;
  }

  /**
   * Get the agent associated with a specific conversation.
   * @param conversationId - ID of the chat.
   * @returns The agent for the specified conversation or null if none found.
   */
  getAgentByConversation(conversationId: string): CustomAgent | null {
    return this.agents.get(conversationId) || null;
  }

  /**
   * Increment the message count for the current agent
   * @param conversationId - ID of the chat.
   */
  incrementMessageCountForCurrentAgent(conversationId: string) {
    if (this.agents.has(conversationId)) {
      const currentCount = this.messageCounts.get(conversationId) || 0;
      this.messageCounts.set(conversationId, currentCount + 1);
    }
  }

  /**
   * Load the message count for the current agent based on its message history.
   * @param conversationId - ID of the chat.
   */
  loadMessageCountForCurrentAgent(conversationId: string) {
    const agent = this.getCurrentAgent(conversationId);
    if (this.agents.has(conversationId)) {
      if (agent) {
        this.messageCounts.set(conversationId, agent.messageHistory.length);
      }
    }
  }

  /**
   * Get the message count for the current agent's conversation.
   * @param conversationId - ID of the chat.
   * @returns The message count for the current agent's conversation.
   */
  getMessageCountForCurrentAgent(conversationId: string): number {
    return this.messageCounts.get(conversationId) || 0;
  }
}

export default AgentManager;
