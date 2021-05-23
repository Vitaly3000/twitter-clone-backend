import { model, Schema, Document } from 'mongoose';
export interface UserModelInterface {
  email: string;
  fullname: string;
  username: string;
  password: string;
  confirmed?: boolean;
  confirmHash: string;
  about?: string;
  website?: string;
  location?: string;
}
type UserModelDocumentInterface = UserModelInterface & Document;
const UserSchema = new Schema<UserModelDocumentInterface>({
  email: {
    unique: true,
    required: true,
    type: String,
  },
  fullname: {
    required: true,
    type: String,
  },
  username: {
    required: true,
    type: String,
    unique: true,
  },
  password: {
    required: true,
    type: String,
  },
  confirmed: {
    type: Boolean,
    default: false,
  },
  confirmHash: {
    required: true,
    type: String,
  },
  about: String,
  website: String,
  location: String,
});
export const UserModel = model<UserModelDocumentInterface>('User', UserSchema);
