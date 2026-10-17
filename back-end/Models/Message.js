import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatSession',
      required: true,
      index: true,
    },
    visitorId: { type: String, required: true, index: true },
    sender: {
      type: String,
      enum: ['user', 'admin', 'system'],
      required: true,
    },
    // Text is optional when the message is an image
    content: {
      type: String,
      default: '',
      required: function () {
        return !this.imageUrl;
      },
    },
    imageUrl: { type: String, default: null },
    imagePublicId: { type: String, default: null }, // used to delete from Cloudinary
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);

export default Message;