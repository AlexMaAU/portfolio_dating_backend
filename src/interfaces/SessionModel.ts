import { Document, Types } from 'mongoose';

interface SessionModel extends Document {
  latest_sender: Types.ObjectId;
  latest_receiver: Types.ObjectId;
  unread: boolean;
  banned: boolean;
  all_messages: Types.ObjectId[];
}

export default SessionModel;
