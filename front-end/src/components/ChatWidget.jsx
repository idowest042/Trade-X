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
  const messagesEndRef = useRef(null);
  const hasInitedRef = useRef(false); // prevents double chat:init under StrictMode

  useEffect(() => {
    const id = initializeVisitorId();
    console.log('Visitor ID initialized:', id);

    const SOCKET_URL = window.location.hostname === 'localhost'
      ? 'http://localhost:5000'
      : 'https://trade-x-4lcn.onrender.com';

    const socket = socketService.connect(SOCKET_URL);

    // Named handlers so cleanup removes exactly what we added —
    // never the whole event (which could rip out another mount's listener).
    const handleConnect = () => {
      console.log('✅ Socket connected');
      setConnected(true);

      // Only emit chat:init once per actual connection, not once per
      // effect run (StrictMode runs this effect twice on mount).
      if (!hasInitedRef.current) {
        hasInitedRef.current = true;
        console.log('Emitting chat:init with visitorId:', id);
        socket.emit('chat:init', { visitorId: id });
      }
    };

    const handleDisconnect = () => {
      console.log('❌ Socket disconnected');
      setConnected(false);
      hasInitedRef.current = false; // allow re-init after reconnect
    };

    const handleNewMessage = (message) => {
      console.log('Received chat:newMessage:', message);
      addMessage(message);
    };

    const handleAutoReply = (message) => {
      console.log('Received chat:autoReply:', message);
      addMessage(message);
    };

    const handleAdminReply = (message) => {
      console.log('Received chat:adminReply:', message);
      addMessage(message);
    };

    const handleLoadMessages = (loadedMessages) => {
      console.log('Received chat:loadMessages:', loadedMessages);
      setMessages(loadedMessages);
    };

    const handleError = (error) => {
      console.error('Chat error:', error);
    };

    // Register listeners BEFORE doing anything that could fire them.
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('chat:newMessage', handleNewMessage);
    socket.on('chat:autoReply', handleAutoReply);
    socket.on('chat:adminReply', handleAdminReply);
    socket.on('chat:loadMessages', handleLoadMessages);
    socket.on('chat:error', handleError);

    // If the socket is already connected (e.g. StrictMode's second pass
    // reusing the first mount's live socket), the 'connect' event already
    // fired and we'd never see it — so run init logic directly here too.
    if (socket.connected && !hasInitedRef.current) {
      handleConnect();
    }
    if (socket.connected) {
      setConnected(true);
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('chat:newMessage', handleNewMessage);
      socket.off('chat:autoReply', handleAutoReply);
      socket.off('chat:adminReply', handleAdminReply);
      socket.off('chat:loadMessages', handleLoadMessages);
      socket.off('chat:error', handleError);
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
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
      {/* Chat Widget */}
      {isOpen ? (
        <div
          className="
            bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden
            fixed inset-0 w-full h-full rounded-none
            sm:static sm:inset-auto sm:w-96 sm:h-[500px] sm:rounded-lg
          "
        >
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative flex-shrink-0">
                <MessageCircle className="w-5 h-5" />
                {isConnected && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
                )}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold truncate">TradeX Support</h3>
                <p className="text-xs text-blue-100 flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isConnected ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                  {isConnected ? 'Online' : 'Connecting...'}
                </p>
              </div>
            </div>
            <button
              onClick={closeChat}
              className="hover:bg-blue-700 p-1 rounded transition-colors flex-shrink-0"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400 text-center px-4">
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
                    className={`max-w-[85%] sm:max-w-[75%] rounded-lg px-4 py-2 ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : message.sender === 'admin'
                        ? 'bg-white text-gray-900 border border-gray-200'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
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
            className="p-3 sm:p-4 border-t border-gray-200 bg-white flex-shrink-0"
            style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={!isConnected}
                className="flex-1 min-w-0 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-base"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || !isConnected}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                aria-label="Send message"
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
            aria-label="Open chat"
          >
            <MessageCircle className="w-6 h-6" />
          </button>
          {isConnected && (
            <span className="absolute top-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatWidget;