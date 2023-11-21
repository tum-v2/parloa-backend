import dotenv from 'dotenv';
import { Database, DatabaseConnectOptions } from './db';

dotenv.config();

const dbOptions: DatabaseConnectOptions = {
  uri: `mongodb://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@localhost:${process.env.MONGODB_LOCAL_PORT}/${process.env.MONGODB_DATABASE}?authSource=admin`,
};

const database = Database.getInstance(dbOptions);

const connectToDatabase = async () => {
  try {
    await database.connect();
  } catch (error) {
    console.error('Error connecting to the database:', error);
    process.exit(1);
  }
};

const disconnectFromDatabase = async () => {
  try {
    await database.closeConnection();
  } catch (error) {
    console.error('Error disconnecting from the database:', error);
    process.exit(1);
  }
};

export { database, connectToDatabase, disconnectFromDatabase };
