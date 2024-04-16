import { model, Schema } from 'mongoose';

const messageSchema = new Schema({
  send_user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    required: true,
  },
  receive_user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    required: true,
  },
  content: {
    type: String,
    default: null,
    required: true,
  },
  timestamp: {
    type: String,
    default: Date.now,
  },
});

const Message = model('Message', messageSchema);

export default Message;

