import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import useChatStore from '../stores/chatStore';
import socketService from '../stores/socketService';

const ChatWidget = () => {
  const {
    messages,
    isOpen,
    isConnected,
    visitorId,
    toggleChat,
    closeChat,
    addMessage,
    setMessages,
    setConnected,
    initializeVisitorId
  } = useChatStore();

  const [inputMessage, setInputMessage] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Initialize visitor ID
    const id = initializeVisitorId();
    console.log('Visitor ID initialized:', id);

    // Connect to socket
    // Hardcoded fallback: use localhost during local dev, otherwise hit the deployed backend
    const SOCKET_URL = window.location.hostname === 'localhost'
      ? 'http://localhost:5000'
      : 'https://trade-x-4lcn.onrender.com';
    const socket = socketService.connect(SOCKET_URL);

    // Socket connection event handlers
    socket.on('connect', () => {
      console.log('✅ Socket connected');
      setConnected(true);

      // Initialize chat session after connection
      console.log('Emitting chat:init with visitorId:', id);
      socket.emit('chat:init', { visitorId: id });
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setConnected(false);
    });

    // Listen for messages
    socket.on('chat:newMessage', (message) => {
      console.log('Received chat:newMessage:', message);
      addMessage(message);
      setIsInitialized(true);
    });

    socket.on('chat:autoReply', (message) => {
      console.log('Received chat:autoReply:', message);
      addMessage(message);
    });

    socket.on('chat:adminReply', (message) => {
      console.log('Received chat:adminReply:', message);
      addMessage(message);
    });

    socket.on('chat:loadMessages', (loadedMessages) => {
      console.log('Received chat:loadMessages:', loadedMessages);
      setMessages(loadedMessages);
      setIsInitialized(true);
    });

    socket.on('chat:error', (error) => {
      console.error('Chat error:', error);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('chat:newMessage');
      socket.off('chat:autoReply');
      socket.off('chat:adminReply');
      socket.off('chat:loadMessages');
      socket.off('chat:error');
    };
  }, [addMessage, setMessages, setConnected, initializeVisitorId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!inputMessage.trim() || !visitorId) {
      console.log('Cannot send: empty message or no visitorId');
      return;
    }

    console.log('Sending message:', { visitorId, content: inputMessage.trim() });

    socketService.emit('chat:sendMessage', {
      visitorId,
      content: inputMessage.trim()
    });

    setInputMessage('');
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Widget */}
      {isOpen ? (
        <div className="bg-white rounded-lg shadow-2xl w-96 h-[500px] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <MessageCircle className="w-5 h-5" />
                {/* Online status indicator */}
                {isConnected && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
                )}
              </div>
              <div>
                <h3 className="font-semibold">TradeX Support</h3>
                <p className="text-xs text-blue-100 flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                  {isConnected ? 'Online' : 'Connecting...'}
                </p>
              </div>
            </div>
            <button
              onClick={closeChat}
              className="hover:bg-blue-700 p-1 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                {isConnected ? 'Connecting to support...' : 'Loading...'}
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={message._id || index}
                  className={`flex ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[75%] rounded-lg px-4 py-2 ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : message.sender === 'admin'
                        ? 'bg-white text-gray-900 border border-gray-200'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.createdAt && (
                      <p
                        className={`text-xs mt-1 ${
                          message.sender === 'user'
                            ? 'text-blue-100'
                            : 'text-gray-500'
                        }`}
                      >
                        {formatTime(message.createdAt)}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-gray-200 bg-white"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={!isConnected}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || !isConnected}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Floating Button */
        <div className="relative">
          <button
            onClick={toggleChat}
            className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110"
          >
            <MessageCircle className="w-6 h-6" />
          </button>
          {/* Online indicator on floating button */}
          {isConnected && (
            <span className="absolute top-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatWidget;