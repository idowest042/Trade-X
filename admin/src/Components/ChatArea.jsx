import React, { useState, useEffect, useRef } from 'react';
import { Send, User, AlertCircle, CheckCircle, Clock, X, Menu } from 'lucide-react';
import { format } from 'date-fns';
import useAdminStore from '../Store/adminStore';
import adminSocketService from '../Store/adminSocketService';

const ChatArea = ({ session, onOpenSidebar }) => {
  const { messages, addMessage, markSessionAsRead } = useAdminStore();
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Mark messages as read when chat area is opened
    if (session) {
      markSessionAsRead(session._id);
    }
  }, [session, markSessionAsRead]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputMessage.trim() || !session || isSending) {
      return;
    }

    setIsSending(true);

    try {
      adminSocketService.sendMessage(session.visitorId, inputMessage.trim());
      setInputMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      return format(new Date(timestamp), 'h:mm a');
    } catch {
      return '';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        return 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
      } else {
        return format(date, 'MMM d, yyyy');
      }
    } catch {
      return '';
    }
  };

  const closeSession = () => {
    // You can implement session closing logic here
    console.log('Close session:', session._id);
  };

  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center px-4">
          <User className="w-16 h-16 md:w-20 md:h-20 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
            Select a conversation
          </h3>
          <p className="text-sm md:text-base text-gray-600">
            Choose a chat from the sidebar to view messages and respond
          </p>
          {/* Mobile: Show button to open sidebar */}
          {onOpenSidebar && (
            <button
              onClick={onOpenSidebar}
              className="mt-4 lg:hidden flex items-center gap-2 mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Menu className="w-4 h-4" />
              View Conversations
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white h-full">
      {/* Chat Header */}
      <div className="px-4 md:px-6 py-3 md:py-4 bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4 min-w-0">
            {/* Mobile menu button */}
            {onOpenSidebar && (
              <button
                onClick={onOpenSidebar}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                aria-label="Open sidebar"
              >
                <Menu className="w-5 h-5 text-gray-700" />
              </button>
            )}

            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-base md:text-lg flex-shrink-0">
              {session.visitorId.substring(8, 10).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 text-base md:text-lg truncate">
                Visitor {session.visitorId.substring(8, 20)}...
              </h3>
              <div className="flex items-center gap-2 md:gap-3 mt-1">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  session.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {session.status}
                </span>
                <span className="text-xs md:text-sm text-gray-600 truncate hidden sm:inline">
                  ID: {session.visitorId.substring(0, 15)}...
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={closeSession}
            className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            title="Close conversation"
          >
            <X className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 lg:p-6 space-y-3 md:space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-400">
              <AlertCircle className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2" />
              <p className="text-sm md:text-base">No messages yet</p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => {
            const showDateDivider = index === 0 || 
              formatDate(messages[index - 1]?.createdAt) !== formatDate(message.createdAt);

            return (
              <div key={message._id || index}>
                {/* Date Divider */}
                {showDateDivider && (
                  <div className="flex items-center justify-center my-3 md:my-4">
                    <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                      {formatDate(message.createdAt)}
                    </div>
                  </div>
                )}

                {/* Message */}
                <div
                  className={`flex ${
                    message.sender === 'admin' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div className={`max-w-[85%] md:max-w-[70%] ${message.sender === 'admin' ? 'order-2' : 'order-1'}`}>
                    {/* Sender Label */}
                    <div className={`text-xs font-medium mb-1 px-1 ${
                      message.sender === 'admin' 
                        ? 'text-blue-600 text-right' 
                        : message.sender === 'system'
                        ? 'text-gray-500'
                        : 'text-gray-700'
                    }`}>
                      {message.sender === 'admin' ? 'You' : message.sender === 'system' ? 'System' : 'Visitor'}
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`rounded-2xl px-3 py-2 md:px-4 md:py-3 ${
                        message.sender === 'admin'
                          ? 'bg-blue-600 text-white rounded-tr-none'
                          : message.sender === 'system'
                          ? 'bg-yellow-50 text-gray-700 border border-yellow-200 rounded-tl-none'
                          : 'bg-white text-gray-900 border border-gray-200 rounded-tl-none shadow-sm'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </p>

                      {/* Timestamp and Delivery Status */}
                      <div className={`flex items-center gap-1 mt-2 text-xs ${
                        message.sender === 'admin' 
                          ? 'text-blue-100 justify-end' 
                          : 'text-gray-500'
                      }`}>
                        <Clock className="w-3 h-3" />
                        {formatTime(message.createdAt)}
                        {/* ✅ FIX: Show double checkmarks for delivered admin messages */}
                        {message.sender === 'admin' && (
                          <div className="flex items-center ml-1">
                            <CheckCircle className="w-3 h-3" />
                            <CheckCircle className="w-3 h-3 -ml-1.5" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSendMessage}
        className="px-3 md:px-4 lg:px-6 py-3 md:py-4 bg-white border-t border-gray-200 flex-shrink-0"
      >
        <div className="flex gap-2 md:gap-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your response..."
            disabled={isSending || session.status === 'closed'}
            className="flex-1 px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-xl text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isSending || session.status === 'closed'}
            className="px-4 md:px-6 py-2 md:py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium text-sm md:text-base"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
        {session.status === 'closed' && (
          <p className="text-xs text-gray-500 mt-2">
            This conversation is closed. Reopen it to send messages.
          </p>
        )}
      </form>
    </div>
  );
};

export default ChatArea;