import { MsgSender } from 'db/enum/enums';

interface ChatMessage {
  sender: MsgSender;
  text: string;
}

export default ChatMessage;
