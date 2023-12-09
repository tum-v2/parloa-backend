import { MsgSender } from '@enums/msg-sender.enum';

interface ChatMessage {
  sender: MsgSender;
  text: string;
}

export default ChatMessage;
