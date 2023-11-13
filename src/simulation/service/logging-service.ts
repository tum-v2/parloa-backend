import { format, transports, createLogger } from 'winston';

const customFormat = format.printf(({ level, message, timestamp }) => {
  const formattedMessage = message instanceof Object ? JSON.stringify(message, null, 2) : message;
  return `[${timestamp}] [${level}]: ${formattedMessage}`;
});

const logger = createLogger({
  format: format.combine(format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), customFormat),
  transports: [new transports.Console()],
});

export { logger };
