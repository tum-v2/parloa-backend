import { Types } from 'mongoose';

interface StartChatRequest {
  name: string;
  agent: Types.ObjectId;
}

export { StartChatRequest };
