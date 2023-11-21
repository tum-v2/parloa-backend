import { Schema, Document, model } from 'mongoose';
interface UserDocument extends Document {
  username: string;
  email: string;
  accessCode: string;
  lastLogin?: Date;
}

const UserSchema: Schema = new Schema(
  {
    username: { type: String, unique: true, trim: true },
    email: { type: String, unique: true, lowercase: true, trim: true },
    accessCode: { type: String, required: true, unique: true, trim: true },
    lastLogin: { type: Date, default: null },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  },
);

const UserModel = model<UserDocument>('User', UserSchema);

export { UserModel, UserDocument };
