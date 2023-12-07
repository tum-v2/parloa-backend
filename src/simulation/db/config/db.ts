import mongoose, { ConnectOptions } from 'mongoose';
import { logger } from '@simulation/service/logging.service';

interface DatabaseConnectOptions {
  uri: string;
  options?: ConnectOptions;
}

class Database {
  private static instance: Database;
  private connectionUri: string;
  private connectionOptions: ConnectOptions;
  private isConnected: boolean;

  private constructor(options: DatabaseConnectOptions) {
    this.connectionUri = options.uri;
    this.connectionOptions = options.options || {};
    this.isConnected = false;

    this.initialize();
  }

  public static getInstance(options: DatabaseConnectOptions): Database {
    if (!Database.instance) {
      Database.instance = new Database(options);
    }
    return Database.instance;
  }

  private initialize(): void {
    mongoose.connection.on('connecting', () => {
      logger.info('Connecting to MongoDB...');
    });

    mongoose.connection.on('connected', () => {
      this.isConnected = true;
      logger.info('Connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      this.isConnected = false;
      logger.info('Disconnected from MongoDB');
    });

    // Signal Interrupt event is used to capture the termination signal for graceful shutdown and resource cleanup
    process.on('SIGINT', async () => {
      if (this.isConnected) {
        await this.closeConnection();
        process.exit(0);
      }
    });

    this.connect();
  }

  public async connect(): Promise<void> {
    try {
      await mongoose.connect(this.connectionUri, this.connectionOptions);
    } catch (error) {
      logger.error('Error connecting to MongoDB:', error);
      throw error;
    }
  }

  public async closeConnection(): Promise<void> {
    if (this.isConnected) {
      try {
        await mongoose.disconnect();
        logger.info('MongoDB connection closed');
      } catch (error) {
        logger.error('Error closing MongoDB connection:', error);
        throw error;
      }
    }
  }

  public isConnectedToDatabase(): boolean {
    return this.isConnected;
  }
}

export { Database, DatabaseConnectOptions };
