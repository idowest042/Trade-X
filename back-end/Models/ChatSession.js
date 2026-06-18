import mongoose from 'mongoose';

const chatSessionSchema = new mongoose.Schema(
  {
    visitorId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    status: {
      type: String,
      enum: ['active', 'closed'],
      default: 'active'
    },
    lastMessageAt: {
      type: Date,
      default: Date.now
    },
    metadata: {
      hasAdminReplied: {
        type: Boolean,
        default: false
      },
      userAgent: String,
      ipAddress: String
    }
  },
  {
    timestamps: true
  }
);

// Check if model already exists before creating it
const ChatSession = mongoose.models.ChatSession || mongoose.model('ChatSession', chatSessionSchema);

export default ChatSession;