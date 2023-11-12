import dotenv from 'dotenv';
import { Database, DatabaseConnectOptions } from './db';

dotenv.config();

const dbOptions: DatabaseConnectOptions = {
  uri: process.env.MONGODB_URI || 'MONGODB_URI',
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

export { database, connectToDatabase };
