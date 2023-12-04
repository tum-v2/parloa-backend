import { execSync } from 'child_process';
import { MessageDocument } from '@simulation/db/models/message.model';

/**
 * Calls the python script to calculate the average similarity of the agent messages in a conversation.
 * @param messages - The messages to calculate the similarity for.
 * @returns Similarity score of all agent messages.
 */
function similarityHandler(messages: MessageDocument[]) {
  var jsonMessages = JSON.stringify(messages);
  return parseFloat(execSync(`python3 evaluation.similarity.py ${jsonMessages} 1`).toString());
}

/**
 * Calls the python script to calculate the recovery rate
 * @param messages - The messages to calculate the recovery rate for.
 * @returns Recovery rate of the agent.
 */
function recoveryHandler(messages: MessageDocument[]) {
  var jsonMessages = JSON.stringify(messages);
  return parseFloat(execSync(`python3 evaluation.recovery.py ${jsonMessages}`).toString());
}

/**
 * Calls the python script to conduct the sentiment analysis
 * @param messages - The messages to calculate the sentiment for.
 * @returns Non-normalized sentiment polarity of the agent.
 */
function sentimentHandler(messages: MessageDocument[]) {
  var jsonMessages = JSON.stringify(messages);
  return parseFloat(execSync(`python3 evaluation.sentiment.py ${jsonMessages}`).toString());
}

export { similarityHandler, recoveryHandler, sentimentHandler };
