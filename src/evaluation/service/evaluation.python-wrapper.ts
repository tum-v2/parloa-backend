import { execSync } from 'child_process';
import { MessageDocument } from '@db/models/message.model';
import * as fs from 'fs';

/**
 * Calls the python script to calculate the average similarity of the agent messages in a conversation.
 * @param messages - The messages to calculate the similarity for.
 * @returns Similarity score of all agent messages.
 */
function similarityHandler(messages: MessageDocument[]) {
  const path = 'messages.json';
  fs.writeFileSync(path, JSON.stringify(messages));
  const result: number = parseFloat(
    execSync(`python3 src/evaluation/service/evaluation.similarity.py ${path} 1`).toString(),
  );
  fs.unlinkSync(path);
  return result;
}

/**
 * Calls the python script to calculate the recovery rate
 * @param messages - The messages to calculate the recovery rate for.
 * @returns Recovery rate of the agent.
 */
function recoveryHandler(messages: MessageDocument[]) {
  const path = 'messages.json';
  fs.writeFileSync(path, JSON.stringify(messages));
  const result: number = parseFloat(
    execSync(`python3 src/evaluation/service/evaluation.recovery.py ${path}`).toString(),
  );
  fs.unlinkSync(path);
  return result;
}

/**
 * Calls the python script to conduct the sentiment analysis
 * @param messages - The messages to calculate the sentiment for.
 * @returns Non-normalized sentiment polarity of the agent.
 */
function sentimentHandler(messages: MessageDocument[]) {
  const path = 'messages.json';
  fs.writeFileSync(path, JSON.stringify(messages));
  const result: number = parseFloat(
    execSync(`python3 src/evaluation/service/evaluation.sentiment.py ${path}`).toString(),
  );
  fs.unlinkSync(path);
  return result;
}

export { similarityHandler, recoveryHandler, sentimentHandler };
