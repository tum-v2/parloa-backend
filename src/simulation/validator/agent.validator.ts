import { body, param, ValidationChain } from 'express-validator';

import { LLMModel } from '@enums/llm-model.enum';
import { ConversationDomain } from '@enums/conversation-domain.enum';
import { AgentType } from '@enums/agent-type.enum';
import { PromptPart } from '@db/models/agent.model';

class AgentValidator {
  /**
   * Validate the request body for the create agent endpoint
   * @returns Validation chain array that checks agent creation request
   */
  static createValidation(): ValidationChain[] {
    return [
      body('name').isString().withMessage('Name must be a valid string.'),
      body('type')
        .isIn(Object.values(AgentType))
        .withMessage(`Invalid agent type. Must be one of: ${Object.values(AgentType).join(', ')}`),
      body('llm')
        .isIn(Object.values(LLMModel))
        .withMessage(`Invalid model type. Must be one of: ${Object.values(LLMModel).join(', ')}`),
      body('temperature').isFloat().withMessage('Temperature must be a valid integer.'),
      body('maxTokens').isInt().withMessage('Max tokens must be a valid integer.'),
      body('domain')
        .isIn(Object.values(ConversationDomain))
        .withMessage(`Invalid domain type. Must be one of: ${Object.values(ConversationDomain).join(', ')}`),
      body('prompt')
        .isArray({ min: 1 })
        .withMessage('Prompt must be a non-empty array')
        .custom((value: PromptPart[]) => {
          const valid = value.every(
            (item) =>
              typeof item === 'object' &&
              'name' in item &&
              'content' in item &&
              typeof item.name === 'string' &&
              typeof item.content === 'string' &&
              ['welcomeMessage', 'role', 'persona', 'tools', 'tasks', 'conversationStrategy'].includes(item.name),
          );

          if (!valid) {
            throw new Error(
              'Prompt array must contain objects with valid name and content fields. Valid names: welcomeMessage, role, persona, tools, tasks, conversationStrategy!',
            );
          }

          const tasksAndToolsValid = value.every((item) => {
            if (item.name === 'tasks' || item.name === 'tools') {
              try {
                JSON.parse(item.content);
                return true;
              } catch (error) {
                return false;
              }
            }
            return true;
          });

          if (!tasksAndToolsValid) {
            throw new Error('Content of tasks and tools should be valid JSON strings');
          }

          return true;
        }),

      body('goal').optional().isMongoId().withMessage('Invalid goal ID.'),

      // service agent must not have a goal
      body().custom((value, { req }) => {
        if (req.body.type === AgentType.SERVICE && req.body.goal) {
          throw new Error('Service agents must not have a goal.');
        }

        if (req.body.type === AgentType.USER && !req.body.goal) {
          throw new Error('User agents must have a goal.');
        }

        return true;
      }),

      body().custom((value, { req }) => {
        const allowedFields = ['name', 'type', 'llm', 'temperature', 'maxTokens', 'domain', 'prompt', 'goal'];

        const extraFields = Object.keys(req.body).filter((field) => !allowedFields.includes(field));

        if (extraFields.length > 0) {
          throw new Error(`Unexpected fields: ${extraFields.join(', ')}`);
        }

        return true;
      }),
    ];
  }

  /**
   * Validate the request body for the update agent endpoint
   * @returns Validation chain array that checks agent update request
   */
  static updateValidation(): ValidationChain[] {
    return [
      body('name').optional().isString().withMessage('Name must be a valid string.'),
      body('type')
        .optional()
        .isIn(Object.values(AgentType))
        .withMessage(`Invalid agent type. Must be one of: ${Object.values(AgentType).join(', ')}`),
      body('llm')
        .optional()
        .isIn(Object.values(LLMModel))
        .withMessage(`Invalid model type. Must be one of: ${Object.values(LLMModel).join(', ')}`),
      body('temperature').optional().isFloat().withMessage('Temperature must be a valid integer.'),
      body('maxTokens').optional().isInt().withMessage('Max tokens must be a valid integer.'),
      body('domain')
        .optional()
        .isIn(Object.values(ConversationDomain))
        .withMessage(`Invalid domain type. Must be one of: ${Object.values(ConversationDomain).join(', ')}`),
      body('prompt')
        .optional()
        .isArray({ min: 1 })
        .withMessage('Prompt must be a non-empty array')
        .custom((value: PromptPart[]) => {
          const valid = value.every(
            (item) =>
              typeof item === 'object' &&
              'name' in item &&
              'content' in item &&
              typeof item.name === 'string' &&
              typeof item.content === 'string' &&
              ['welcomeMessage', 'role', 'persona', 'tools', 'tasks', 'conversationStrategy'].includes(item.name),
          );

          if (!valid) {
            throw new Error(
              'Prompt array must contain objects with valid name and content fields. Valid names: welcomeMessage, role, persona, tools, tasks, conversationStrategy!',
            );
          }

          const tasksAndToolsValid = value.every((item) => {
            if (item.name === 'tasks' || item.name === 'tools') {
              try {
                JSON.parse(item.content);
                return true;
              } catch (error) {
                return false;
              }
            }
            return true;
          });

          if (!tasksAndToolsValid) {
            throw new Error('Content of tasks and tools should be valid JSON strings');
          }

          return true;
        }),
      body('goal').optional().isMongoId().withMessage('Invalid goal ID.'),

      // service agent must not have a goal
      body().custom((value, { req }) => {
        if (req.body.type === AgentType.SERVICE && req.body.goal) {
          throw new Error('Service agents must not have a goal.');
        }

        if (req.body.type === AgentType.USER && !req.body.goal) {
          throw new Error('User agents must have a goal.');
        }

        return true;
      }),

      body().custom((value, { req }) => {
        const allowedFields = ['name', 'type', 'llm', 'temperature', 'maxTokens', 'domain', 'prompt', 'goal'];

        const extraFields = Object.keys(req.body).filter((field) => !allowedFields.includes(field));

        if (extraFields.length > 0) {
          throw new Error(`Unexpected fields: ${extraFields.join(', ')}`);
        }

        return true;
      }),
    ];
  }

  /**
   * Validate the request parameter /:id for get, update and delete endpoints
   * @returns Validation chain array that checks simulation run request
   */
  static idValidation(): ValidationChain[] {
    return [param('id').isMongoId().withMessage('Invalid agent ID.')];
  }

  /**
   * Validate the request parameter /:id for get, update and delete endpoints
   * @returns Validation chain array that checks valid agent ID
   */
  static agentConfigFieldsValidation(agentConfig: string): ValidationChain[] {
    return [
      body(`${agentConfig}.name`).isString().withMessage(`Name must be a valid string for ${agentConfig}.`),
      body(`${agentConfig}.type`)
        .isIn(Object.values(AgentType))
        .withMessage(`Invalid agent type for ${agentConfig}. Must be one of: ${Object.values(AgentType).join(', ')}`),
      body(`${agentConfig}.llm`)
        .isIn(Object.values(LLMModel))
        .withMessage(`Invalid model type for ${agentConfig}. Must be one of: ${Object.values(LLMModel).join(', ')}`),
      body(`${agentConfig}.temperature`)
        .isFloat()
        .withMessage(`Temperature must be a valid integer for ${agentConfig}.`),
      body(`${agentConfig}.maxTokens`).isInt().withMessage(`Max tokens must be a valid integer for ${agentConfig}.`),
      body(`${agentConfig}.domain`)
        .isIn(Object.values(ConversationDomain))
        .withMessage(
          `Invalid domain type for ${agentConfig}. Must be one of: ${Object.values(ConversationDomain).join(', ')}`,
        ),
      body(`${agentConfig}.prompt`)
        .isArray({ min: 1 })
        .withMessage(`Prompt must be a non-empty array for ${agentConfig}`)
        .custom((value: PromptPart[]) => {
          const valid = value.every(
            (item) =>
              typeof item === 'object' &&
              'name' in item &&
              'content' in item &&
              typeof item.name === 'string' &&
              typeof item.content === 'string' &&
              ['welcomeMessage', 'role', 'persona', 'tools', 'tasks', 'conversationStrategy'].includes(item.name),
          );

          if (!valid) {
            throw new Error(
              `Prompt array for ${agentConfig} must contain objects with valid name and content fields. Valid names: welcomeMessage, role, persona, tools, tasks, conversationStrategy!`,
            );
          }

          const tasksAndToolsValid = value.every((item) => {
            if (item.name === 'tasks' || item.name === 'tools') {
              try {
                JSON.parse(item.content);
                return true;
              } catch (error) {
                return false;
              }
            }
            return true;
          });

          if (!tasksAndToolsValid) {
            throw new Error(`Content of ${agentConfig}.tasks and ${agentConfig}.tools should be valid JSON strings`);
          }

          return true;
        }),

      body(`${agentConfig}.goal`).optional().isMongoId().withMessage('Invalid goal ID.'),

      // service agent must not have a goal
      body(agentConfig).custom((value) => {
        if (value.type === AgentType.SERVICE && value.goal) {
          throw new Error('Service agents must not have a goal.');
        }

        if (value.type === AgentType.USER && !value.goal) {
          throw new Error('User agents must have a goal.');
        }

        return true;
      }),

      body(agentConfig).custom((value) => {
        const allowedFields = ['name', 'type', 'llm', 'temperature', 'maxTokens', 'domain', 'prompt', 'goal'];

        const extraFields = Object.keys(value).filter((field) => !allowedFields.includes(field));

        if (extraFields.length > 0) {
          throw new Error(`Unexpected fields: ${extraFields.join(', ')}`);
        }

        return true;
      }),
    ];
  }
}

export default AgentValidator;
