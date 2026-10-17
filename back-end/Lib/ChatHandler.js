import ChatSession from '../Models/ChatSession.js';
import Message from '../Models/Message.js';
import emailService from '../Lib/emailService.js';
import cloudinary from '../Config/cloudinary.js';

// Only accept images that were uploaded to OUR Cloudinary account/folder,
// so nobody can send arbitrary external URLs through the socket.
const validateImage = (imageUrl, imagePublicId) => {
  if (!imageUrl) return { ok: true, image: null };

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const validUrl =
    typeof imageUrl === 'string' &&
    imageUrl.startsWith(`https://res.cloudinary.com/${cloudName}/`);
  const validId =
    typeof imagePublicId === 'string' && imagePublicId.startsWith('tradex/chat/');

  if (!validUrl || !validId) return { ok: false, image: null };
  return { ok: true, image: { imageUrl, imagePublicId } };
};

// Builds the sessions list the admin dashboard shows
const getSessionsWithLastMessage = async () => {
  const sessions = await ChatSession.find()
    .sort({ lastMessageAt: -1 })
    .limit(50);

  return Promise.all(
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
};

export const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log('✅ New client connected:', socket.id);

    // Initialize chat session
    socket.on('chat:init', async ({ visitorId }) => {
      console.log('📥 Received chat:init for visitorId:', visitorId);
      
      try {
        let session = await ChatSession.findOne({ visitorId });

        if (!session) {
          console.log('Creating new session for visitorId:', visitorId);
          session = await ChatSession.create({ 
            visitorId,
            metadata: {
              hasAdminReplied: false // Track if admin has responded
            }
          });
          
          // Send welcome message
          const welcomeMessage = await Message.create({
            sessionId: session._id,
            visitorId,
            sender: 'system',
            content: 'Hello 👋, how can we help you today?'
          });

          console.log('📤 Sending welcome message:', welcomeMessage);
          socket.emit('chat:newMessage', welcomeMessage);
        } else {
          console.log('Session already exists, loading messages for visitorId:', visitorId);
          // Load existing messages
          const messages = await Message.find({ sessionId: session._id })
            .sort({ createdAt: 1 });
          
          console.log('📤 Sending', messages.length, 'existing messages');
          socket.emit('chat:loadMessages', messages);
        }

        // Join room for this visitor
        socket.join(visitorId);
        console.log('✅ Socket joined room:', visitorId);
      } catch (error) {
        console.error('❌ Error initializing chat:', error);
        socket.emit('chat:error', { message: 'Failed to initialize chat' });
      }
    });

    // User sends a message (text and/or image)
    socket.on('chat:sendMessage', async ({ visitorId, content, imageUrl, imagePublicId }) => {
      console.log('📥 Received chat:sendMessage from', visitorId, ':', content, imageUrl ? '(with image)' : '');
      
      try {
        const text = (content || '').trim();
        const { ok, image } = validateImage(imageUrl, imagePublicId);

        if (!ok) {
          socket.emit('chat:error', { message: 'Invalid image' });
          return;
        }
        if (!text && !image) {
          return;
        }

        const session = await ChatSession.findOne({ visitorId });
        
        if (!session) {
          console.error('❌ Session not found for visitorId:', visitorId);
          socket.emit('chat:error', { message: 'Session not found' });
          return;
        }

        console.log('Session found:', session._id);

        // Save user message
        const userMessage = await Message.create({
          sessionId: session._id,
          visitorId,
          sender: 'user',
          content: text,
          ...(image || {})
        });

        console.log('✅ User message saved:', userMessage._id);

        // Update session last message time
        session.lastMessageAt = new Date();
        await session.save();

        // Emit to user
        console.log('📤 Emitting chat:newMessage to user');
        socket.emit('chat:newMessage', userMessage);

        // Emit to admin dashboard
        console.log('📤 Broadcasting admin:newMessage');
        io.emit('admin:newMessage', {
          sessionId: session._id,
          visitorId,
          message: userMessage
        });

        // Don't block the request on the email send.
        console.log('📧 Sending email notification (non-blocking)...');
        emailService.sendNewMessageNotification(
          visitorId,
          text ? (image ? `${text} (+ image: ${image.imageUrl})` : text) : `📷 Sent an image: ${image.imageUrl}`
        ).catch((err) => console.error('❌ Email notification failed:', err));

        // Only send auto-reply if admin hasn't responded yet
        const hasAdminReplied = session.metadata?.hasAdminReplied || false;

        if (!hasAdminReplied) {
          console.log('📤 Scheduling auto-reply (admin has not responded yet)');
          setTimeout(async () => {
            try {
              const autoReply = await Message.create({
                sessionId: session._id,
                visitorId,
                sender: 'system',
                content: 'Thanks for reaching out. A support agent will respond within a few minutes.'
              });

              console.log('📤 Auto-reply sent:', autoReply._id);

              if (socket.connected) {
                socket.emit('chat:autoReply', autoReply);
              } else {
                console.log('⏭️  Socket disconnected before auto-reply could be delivered (message still saved)');
              }
            } catch (err) {
              console.error('❌ Error creating/sending auto-reply:', err);
            }
          }, 1000);
        } else {
          console.log('⏭️  Skipping auto-reply (admin has already responded)');
        }

      } catch (error) {
        console.error('❌ Error sending message:', error);
        socket.emit('chat:error', { message: 'Failed to send message' });
      }
    });

    // Admin sends a message (text and/or image)
    socket.on('admin:sendMessage', async ({ visitorId, content, imageUrl, imagePublicId }) => {
      console.log('📥 Received admin:sendMessage to', visitorId, ':', content, imageUrl ? '(with image)' : '');
      
      try {
        const text = (content || '').trim();
        const { ok, image } = validateImage(imageUrl, imagePublicId);

        if (!ok) {
          socket.emit('chat:error', { message: 'Invalid image' });
          return;
        }
        if (!text && !image) {
          return;
        }

        const session = await ChatSession.findOne({ visitorId });
        
        if (!session) {
          console.error('❌ Session not found for visitorId:', visitorId);
          socket.emit('chat:error', { message: 'Session not found' });
          return;
        }

        console.log('Session found:', session._id);

        // Create admin message
        const adminMessage = await Message.create({
          sessionId: session._id,
          visitorId,
          sender: 'admin',
          content: text,
          ...(image || {}),
          read: true // Admin messages are automatically "read" by admin
        });

        console.log('✅ Admin message saved:', adminMessage._id);

        // Mark that admin has replied (stop auto-replies)
        if (!session.metadata) {
          session.metadata = {};
        }
        session.metadata.hasAdminReplied = true;
        session.lastMessageAt = new Date();
        await session.save();
        
        console.log('✅ Session marked as admin-replied');

        // Send to user in real-time
        console.log('📤 Emitting chat:adminReply to user');
        io.to(visitorId).emit('chat:adminReply', adminMessage);

        // Confirm to admin with delivery status
        console.log('📤 Confirming message sent to admin');
        socket.emit('admin:messageSent', {
          ...adminMessage.toObject(),
          delivered: true // Add delivery status
        });

        // Broadcast to all admin dashboards to update in real-time
        io.emit('admin:messageUpdate', {
          sessionId: session._id,
          visitorId,
          message: adminMessage
        });

      } catch (error) {
        console.error('❌ Error sending admin message:', error);
        socket.emit('chat:error', { message: 'Failed to send admin message' });
      }
    });

    // Admin deletes an entire conversation
    socket.on('admin:deleteSession', async ({ visitorId }) => {
      console.log('📥 Received admin:deleteSession for', visitorId);

      try {
        const session = await ChatSession.findOne({ visitorId });

        if (!session) {
          socket.emit('chat:error', { message: 'Session not found' });
          return;
        }

        // Remove this conversation's images from Cloudinary
        const withImages = await Message.find({
          sessionId: session._id,
          imagePublicId: { $ne: null }
        }).select('imagePublicId');

        await Promise.allSettled(
          withImages.map((m) =>
            cloudinary.uploader.destroy(m.imagePublicId, { resource_type: 'image' })
          )
        );

        await Message.deleteMany({ sessionId: session._id });
        await ChatSession.deleteOne({ _id: session._id });

        console.log('🗑️  Session deleted:', session._id);

        // Reset the visitor's widget (it will start a fresh chat)
        io.to(visitorId).emit('chat:sessionDeleted');

        // Tell admin dashboards, and push a fresh list through the
        // existing 'admin:sessions' event so no store changes are needed
        io.emit('admin:sessionDeleted', { sessionId: session._id, visitorId });
        io.emit('admin:sessions', await getSessionsWithLastMessage());
      } catch (error) {
        console.error('❌ Error deleting session:', error);
        socket.emit('chat:error', { message: 'Failed to delete conversation' });
      }
    });

    // Admin requests all sessions
    socket.on('admin:getSessions', async () => {
      try {
        socket.emit('admin:sessions', await getSessionsWithLastMessage());
      } catch (error) {
        console.error('Error fetching sessions:', error);
        socket.emit('chat:error', { message: 'Failed to fetch sessions' });
      }
    });

    // Admin requests messages for a session
    socket.on('admin:getMessages', async ({ visitorId }) => {
      try {
        const session = await ChatSession.findOne({ visitorId });
        
        if (!session) {
          socket.emit('chat:error', { message: 'Session not found' });
          return;
        }

        const messages = await Message.find({ sessionId: session._id })
          .sort({ createdAt: 1 });

        // Mark user messages as read
        await Message.updateMany(
          { sessionId: session._id, sender: 'user', read: false },
          { read: true }
        );

        socket.emit('admin:messages', messages);
      } catch (error) {
        console.error('Error fetching messages:', error);
        socket.emit('chat:error', { message: 'Failed to fetch messages' });
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};