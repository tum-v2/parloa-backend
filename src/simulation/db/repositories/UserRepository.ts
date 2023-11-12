import { Model } from 'mongoose';
import { logger } from '../../service/logging-service';
import { UserDocument } from '../models/User';
import { BaseRepository } from './BaseRepository';

class UserRepository extends BaseRepository<UserDocument> {
  constructor(model: Model<UserDocument>) {
    super(model);
  }

  async findByUsername(username: string): Promise<UserDocument | null> {
    try {
      const user = await this.model.findOne({ username }).exec();
      if (user) {
        logger.info(`User found by username: ${user}`);
        return user;
      } else {
        logger.warn(`User not found by username: ${username}`);
        return null;
      }
    } catch (error) {
      logger.error(`Error finding user by username: ${username}`);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    try {
      const user = await this.model.findOne({ email }).exec();
      if (user) {
        logger.info(`User found by email: ${user}`);
        return user;
      } else {
        logger.warn(`User not found by email: ${email}`);
        return null;
      }
    } catch (error) {
      logger.error(`Error finding user by email: ${email}`);
      throw error;
    }
  }
}

export { UserRepository };
