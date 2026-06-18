import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatSession',
      required: true,
      index: true
    },
    visitorId: {
      type: String,
      required: true
    },
    sender: {
      type: String,
      enum: ['user', 'admin', 'system'],
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    read: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);

export default Message;