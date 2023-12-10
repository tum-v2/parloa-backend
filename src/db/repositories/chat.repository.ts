import { Model, Types } from 'mongoose';
import { MessageDocument } from '@db/models/message.model';
import { ConversationDocument } from '@db/models/conversation.model';
import { SimulationDocument } from '@db/models/simulation.model';
import { SimulationRepository } from '@db/repositories/simulation.repository';
import { logger } from '@utils/logger';
import { MsgHistoryItem } from '@simulation/agents/custom.agent';
import { AIMessage, BaseMessage, HumanMessage, SystemMessage } from 'langchain/schema';
import { ConversationStatus } from '@enums/conversation-status.enum';
import { SimulationType } from '@enums/simulation-type.enum';

class ChatRepository extends SimulationRepository {
  private messageModel: Model<MessageDocument>;
  private conversationModel: Model<ConversationDocument>;

  constructor(
    model: Model<SimulationDocument>,
    messageModel: Model<MessageDocument>,
    conversationModel: Model<ConversationDocument>,
  ) {
    super(model);
    this.messageModel = messageModel;
    this.conversationModel = conversationModel;
  }

  async create(config: Partial<SimulationDocument>): Promise<SimulationDocument> {
    try {
      const conversation = await this.conversationModel.create({
        startTime: new Date(),
        status: ConversationStatus.ONGOING,
      });
      config.conversations = [conversation._id];
      const chat: SimulationDocument = await super.create(config);

      return this._populate(chat);
    } catch (error) {
      logger.error(`Error creating chat!`);
      throw error;
    }
  }

  async send(chatId: string, message: MessageDocument): Promise<SimulationDocument> {
    try {
      // get conversation id from chatId
      const chat: SimulationDocument | null = await this.model.findById(chatId);
      if (!chat) {
        throw new Error(`Chat not found by id: ${chatId}`);
      }

      const conversationId = chat.conversations[0];

      // Step 2: Update the conversation with the new message
      const updatedConversation: ConversationDocument | null = await this.conversationModel.findOneAndUpdate(
        { _id: conversationId }, // find a conversation with this _id
        { $push: { messages: message._id } }, // push the new message _id to the messages array
        { new: true }, // option to return the updated document
      );

      // Step 3: Update the simulation with the updated conversation
      if (!updatedConversation) {
        throw new Error(`Conversation not found by id: ${conversationId}`);
      }

      const updatedChat: SimulationDocument | null = await this.model.findOneAndUpdate(
        { _id: chatId }, // find a simulation with this conversation
        {
          $set: {
            'conversations[0]': updatedConversation,
            totalNumberOfInteractions: updatedConversation.messages.length,
          },
        }, // update the conversation in the conversations array
        { new: true }, // option to return the updated document
      );

      if (!updatedChat) {
        throw new Error(`Chat not found by id: ${chatId}`);
      }

      return updatedChat;
    } catch (error) {
      logger.error(`Error sending message to chat ${chatId}!`);
      throw error;
    }
  }

  async loadChat(chatId: string): Promise<[Types.ObjectId, MsgHistoryItem[]]> {
    try {
      // Get conversation ID from chatId
      const chat: SimulationDocument | null = await this.model.findById(chatId);
      if (!chat) {
        throw new Error(`Chat not found by id: ${chatId}`);
      }

      const conversationId = chat.conversations[0];
      const agentId = chat.serviceAgent as Types.ObjectId;

      // Get conversation document by ID
      const conversation = await this.conversationModel.findById(conversationId);
      if (!conversation) {
        throw new Error(`Conversation not found by id: ${conversationId}`);
      }

      const messageIds = conversation.messages;

      const messages = await this.messageModel.find({ _id: { $in: messageIds } });

      const msgHistory: MsgHistoryItem[] = this.createMsgHistoryItems(messages);

      return [agentId, msgHistory];
    } catch (error) {
      console.log(`Error while loading the chat:  ${chatId}!`);
      throw error;
    }
  }

  createMsgHistoryItems(messages: MessageDocument[]): MsgHistoryItem[] {
    return messages.map((message) => {
      const userInput: string | undefined = message.userInput !== null ? message.userInput : undefined;
      const msgToUser: string | undefined = message.msgToUser !== null ? message.msgToUser : undefined;
      const intermediateMsg: string | undefined =
        message.intermediateMsg !== null ? message.intermediateMsg : undefined;
      const action: string | undefined = message.action !== null ? message.action : undefined;
      const toolInput: Record<string, any> | undefined = message.toolInput !== null ? message.toolInput : undefined;
      const toolOutput: any | undefined = message.toolOutput !== null ? message.toolOutput : undefined;
      const parentId: string | undefined = message.parentId !== null ? message.parentId : undefined;

      let lcMsg: BaseMessage;
      const type = message.type.toLowerCase();

      if (type.includes('human')) {
        lcMsg = new HumanMessage(message.lcMsg.content.toString());
      } else if (type.includes('system')) {
        lcMsg = new SystemMessage(message.lcMsg.content.toString());
      } else {
        lcMsg = new AIMessage(message.lcMsg.content.toString());
      }

      return new MsgHistoryItem(
        lcMsg,
        message.type,
        userInput,
        msgToUser,
        intermediateMsg,
        action,
        toolInput,
        toolOutput,
        parentId,
      );
    });
  }

  async findAll(): Promise<SimulationDocument[]> {
    try {
      const result: SimulationDocument[] = await this.model.find({ type: SimulationType.CHAT });
      return result;
    } catch (error) {
      logger.error(`Error finding chats!`);
      throw error;
    }
  }
}

export { ChatRepository };
