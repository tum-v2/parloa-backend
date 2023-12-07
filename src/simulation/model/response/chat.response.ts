import { MsgSender } from '@simulation/db/enum/enums';

interface ChatMessage {
  sender: MsgSender;
  text: string;
}

export default ChatMessage;
