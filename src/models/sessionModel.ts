import { Schema, model } from 'mongoose';

const sessionSchema = new Schema({
  latest_sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    required: true,
  },
  latest_receiver: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    required: true,
  },
  latest_message: {
    type: String,
    default: null,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  unread: {
    type: Boolean,
    default: false,
  },
  banned: {
    type: Boolean,
    default: false,
    index: true,
  },
  all_messages: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Message',
      },
    ],
    default: [],
    index: true,
  },
});

const Session = model('Session', sessionSchema);

export default Session;

