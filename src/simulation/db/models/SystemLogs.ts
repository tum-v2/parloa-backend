import { Schema, Document, model } from 'mongoose';

enum LogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

enum LogType {
  SYSTEM = 'system',
  USER = 'user',
}

interface SystemLogsDocument extends Document {
  level: LogLevel;
  type: LogType;
  description: string;
}

const systemLogsSchema: Schema = new Schema(
  {
    level: { type: String, enum: Object.values(LogLevel), required: true },
    type: { type: String, enum: Object.values(LogType), required: true },
    description: { type: String, required: true },
  },
  { timestamps: true },
);

const SystemLogsModel = model<SystemLogsDocument>('SystemLogs', systemLogsSchema);

export { SystemLogsModel, SystemLogsDocument, LogLevel, LogType };
