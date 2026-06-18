import express from 'express';
import ChatSession from '../Models/ChatSession.js';
import Message from '../Models/Message.js';

const router = express.Router();

// Get all chat sessions
router.get('/sessions', async (req, res) => {
  try {
    const sessions = await ChatSession.find()
      .sort({ lastMessageAt: -1 })
      .limit(50);

    const sessionsWithLastMessage = await Promise.all(
      sessions.map(async (session) => {
        const lastMessage = await Message.findOne({ sessionId: session._id })
          .sort({ createdAt: -1 });
        
        const unreadCount = await Message.countDocuments({
          sessionId: session._id,
          sender: 'user',
          read: false
        });

        return {
          ...session.toObject(),
          lastMessage,
          unreadCount
        };
      })
    );

    res.json({
      success: true,
      data: sessionsWithLastMessage
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sessions',
      error: error.message
    });
  }
});

// Get messages for a specific session
router.get('/sessions/:visitorId/messages', async (req, res) => {
  try {
    const { visitorId } = req.params;

    const session = await ChatSession.findOne({ visitorId });
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    const messages = await Message.find({ sessionId: session._id })
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
});

// Get session by visitor ID
router.get('/sessions/:visitorId', async (req, res) => {
  try {
    const { visitorId } = req.params;

    const session = await ChatSession.findOne({ visitorId });
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    const messageCount = await Message.countDocuments({ sessionId: session._id });
    const unreadCount = await Message.countDocuments({
      sessionId: session._id,
      sender: 'user',
      read: false
    });

    res.json({
      success: true,
      data: {
        ...session.toObject(),
        messageCount,
        unreadCount
      }
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch session',
      error: error.message
    });
  }
});

// Mark messages as read
router.patch('/sessions/:visitorId/messages/read', async (req, res) => {
  try {
    const { visitorId } = req.params;

    const session = await ChatSession.findOne({ visitorId });
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    await Message.updateMany(
      { sessionId: session._id, sender: 'user', read: false },
      { read: true }
    );

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read',
      error: error.message
    });
  }
});

// Close a chat session
router.patch('/sessions/:visitorId/close', async (req, res) => {
  try {
    const { visitorId } = req.params;

    const session = await ChatSession.findOneAndUpdate(
      { visitorId },
      { status: 'closed' },
      { new: true }
    );
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Error closing session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to close session',
      error: error.message
    });
  }
});

// Get chat statistics
router.get('/stats', async (req, res) => {
  try {
    const totalSessions = await ChatSession.countDocuments();
    const activeSessions = await ChatSession.countDocuments({ status: 'active' });
    const totalMessages = await Message.countDocuments();
    const unreadMessages = await Message.countDocuments({ sender: 'user', read: false });

    res.json({
      success: true,
      data: {
        totalSessions,
        activeSessions,
        totalMessages,
        unreadMessages
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
});

export default router;