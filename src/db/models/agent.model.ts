import { Schema, Document, model, Types } from 'mongoose';
import { ConversationDomain } from '@enums/conversation-domain.enum';
import { LLMModel } from '@enums/llm-model.enum';
import { AgentType } from '@enums/agent-type.enum';
import { GoalDocument } from '@db/models/goal.model';

interface AgentDocument extends Document {
  name: string;
  type: AgentType;
  llm: LLMModel;
  temperature: number;
  maxTokens: number;
  domain: ConversationDomain;
  prompt: string;
  goal?: GoalDocument | Types.ObjectId; // only user agents have a goal
  temporary?: boolean;
}

const agentSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: Object.values(AgentType), required: true },
    llm: { type: String, enum: Object.values(LLMModel), required: true },
    temperature: { type: Number, required: true },
    maxTokens: { type: Number, required: true },
    domain: { type: String, enum: Object.values(ConversationDomain), required: true },
    prompt: { type: String, required: true },
    goal: { type: Schema.Types.ObjectId, ref: 'Goal' },
    temporary: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// validate type and goal for creation
// this is mainly for the case where agents are created through simulation creations
// instead of branching endlessly in the simulation validator, we can just throw an error here
agentSchema.pre('save', async function (next) {
  const { type, goal } = this;

  if (type === AgentType.USER && !goal) {
    return next(new Error('goal must set for USER agent.'));
  }
  if (type === AgentType.SERVICE && goal) {
    return next(new Error('goal must not set for SERVICE agent.'));
  }

  next();
});

// validate type and goal for update
// this is mainly for the case where agents are updated through agent API
agentSchema.pre('findOneAndUpdate', async function (next) {
  // get updated fields from the query
  const update: any = this.getUpdate();
  const updateType = update.$set ? update.$set.type : this.getQuery().type;
  const updateGoal = update.$set ? update.$set.goal : this.getQuery().goal;

  // retrieve the existing document from the database
  const existingDocument = await this.model.findOne(this.getQuery());

  if (existingDocument) {
    const { type: existingType, goal: existingGoal } = existingDocument;

    // check conditions

    // case 1: update only type
    if (updateType && !updateGoal) {
      // if agent is being updated to SERVICE, unset goal
      if (updateType === AgentType.SERVICE && existingGoal) {
        // unset existing goal
        await this.model.updateOne(this.getQuery(), { $unset: { goal: 1 } });
      }

      // if agent is being updated to USER, throw error if goal is not set
      if (updateType === AgentType.USER && !updateGoal && !existingGoal) {
        throw new Error('goal must set for USER agent.');
      }
    }

    // case 2: update only goal
    else if (!updateType && updateGoal) {
      if (existingType === AgentType.SERVICE) {
        throw new Error('goal must not set for SERVICE agent.');
      }
    }

    // case 3: update both type and goal (handled in the validation step)
  }

  next();
});

const AgentModel = model<AgentDocument>('Agent', agentSchema);

export { AgentModel, AgentDocument };
