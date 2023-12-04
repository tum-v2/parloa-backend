import { execSync } from 'child_process';
import { MessageModel, MessageDocument } from '@simulation/db/models/message.model';

function similarityHandler(messages: MessageDocument[]) {
  var jsonMessages = JSON.stringify(messages);
  return parseFloat(execSync(`python3 evaluation.similarity.py ${jsonMessages} 1`).toString());
}

function recoveryHandler(messages: MessageDocument[]) {
  var jsonMessages = JSON.stringify(messages);
  return parseFloat(execSync(`python3 evaluation.recovery.py ${jsonMessages}`).toString());
}

function sentimentHandler(messages: MessageDocument[]) {
  var jsonMessages = JSON.stringify(messages);
  return parseFloat(execSync(`python3 evaluation.sentiment.py ${jsonMessages}`).toString());
}

export { similarityHandler, recoveryHandler, sentimentHandler };
