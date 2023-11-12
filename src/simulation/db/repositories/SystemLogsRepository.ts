import { Model } from 'mongoose';
import { logger } from '../../service/logging-service';
import { BaseRepository } from './BaseRepository';
import { SystemLogsDocument, LogLevel, LogType } from '../models/SystemLogs';

class SystemLogsRepository extends BaseRepository<SystemLogsDocument> {
  constructor(model: Model<SystemLogsDocument>) {
    super(model);
  }

  async findByLevel(level: LogLevel): Promise<SystemLogsDocument[]> {
    try {
      const result = await this.model.find({ level }).exec();
      if (result.length > 0) {
        logger.info(`System logs found by level: ${result}`);
      } else {
        logger.warn(`No system logs found by level: ${level}`);
      }
      return result;
    } catch (error) {
      logger.error(`Error finding system logs by level: ${level}`);
      throw error;
    }
  }

  async findByType(type: LogType): Promise<SystemLogsDocument[]> {
    try {
      const result = await this.model.find({ type }).exec();
      if (result.length > 0) {
        logger.info(`System logs found by type: ${result}`);
      } else {
        logger.warn(`No system logs found by type: ${type}`);
      }
      return result;
    } catch (error) {
      logger.error(`Error finding system logs by type: ${type}`);
      throw error;
    }
  }
}

export { SystemLogsRepository };
