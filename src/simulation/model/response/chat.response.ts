import { MsgSender } from '@enums/msg-sender.enum';

interface ChatMessage {
  sender: MsgSender;
  text: string;
  timestamp: Date;
  userCanReply: boolean;
}

export default ChatMessage;
