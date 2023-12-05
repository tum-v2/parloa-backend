import { Types } from 'mongoose';

interface StartChatRequest {
  name: string;
  serviceAgent: Types.ObjectId;
}

export { StartChatRequest };
