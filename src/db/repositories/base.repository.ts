import { Document, Model } from 'mongoose';
import { logger } from '@utils/logger';

abstract class BaseRepository<T extends Document> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(data: Partial<T>): Promise<T> {
    try {
      const createdDocument = await this.model.create(data);
      logger.info(`Document created:  ${createdDocument}`);
      return createdDocument;
    } catch (error) {
      logger.error('Error creating document:', error);
      throw error;
    }
  }

  async getById(id: string): Promise<T | null> {
    try {
      const document = await this.model.findById(id).exec();
      if (document) {
        logger.info(`Document found by ID: ${document}`);
        return document;
      }
      logger.warn(`Document not found by ID: ${id}`);
      return null;
    } catch (error) {
      logger.error('Error getting document by ID:', error);
      throw error;
    }
  }

  async updateById(id: string, data: Partial<T>): Promise<T | null> {
    try {
      const updatedDocument = await this.model.findByIdAndUpdate(id, { $set: data }, { new: true }).exec();

      if (updatedDocument) {
        logger.info(`Document updated by ID: ${updatedDocument}`);
        return updatedDocument;
      }
      logger.warn(`Document not found for update by ID ${id}`);
      return null;
    } catch (error) {
      logger.error('Error updating document by ID:', error);
      throw error;
    }
  }

  async deleteById(id: string): Promise<boolean> {
    try {
      const result = await this.model.findByIdAndDelete(id).exec();
      if (result) {
        logger.info(`Document deleted by ID: ${id}`);
        return true;
      }
      logger.warn(`Document not found for delete by ID ${id}`);
      return false;
    } catch (error) {
      logger.error('Error deleting document by ID:', error);
      return false;
    }
  }

  async findAll(): Promise<T[]> {
    try {
      const result = await this.model.find().exec();
      return result;
    } catch (error) {
      logger.error(`Error finding documents!`);
      throw error;
    }
  }
}

export { BaseRepository };
