import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file

import { Database, DatabaseConnectOptions } from '@db/config/db';

let dbOptions: DatabaseConnectOptions | null = null;

if (process.env.NODE_ENV === 'development') {
  dbOptions = {
    uri: `mongodb://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}:${process.env.MONGODB_DOCKER_PORT}/${process.env.MONGODB_DATABASE}?authSource=admin`,
  };
} else if (process.env.NODE_ENV === 'production') {
  dbOptions = {
    uri: `${process.env.AZURE_COSMOS_CONNECTIONSTRING}`,
  };
}

let database: Database;

if (dbOptions) {
  database = Database.getInstance(dbOptions);
} else {
  console.error('Invalid configuration or NODE_ENV not set.');
}

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
