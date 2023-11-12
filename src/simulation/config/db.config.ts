// Database config file for both evaluation and simulation systems

const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = process.env;

interface DBConfig {
  url: string;
}

const dbConfig: DBConfig = {
  url: `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin`,
};

export default dbConfig;
