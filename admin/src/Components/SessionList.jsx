import React, { useState } from 'react';
import { MessageCircle, Search, Filter, Clock, AlertCircle, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import useAdminStore from '../Store/adminStore';

const SessionList = ({ onSelectSession, onClose }) => {
  const {
    sessions,
    selectedSession,
    searchQuery,
    filterStatus,
    unreadCount,
    setSearchQuery,
    setFilterStatus,
    getFilteredSessions
  } = useAdminStore();

  const filteredSessions = getFilteredSessions();

  const getStatusColor = (status) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const formatTime = (date) => {
    if (!date) return '';
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return '';
    }
  };

  return (
    <div className="w-full h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-white" />
            <h2 className="text-base md:text-lg font-bold text-white">Support Chats</h2>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
            {/* Close button for mobile */}
            {onClose && (
              <button
                onClick={onClose}
                className="lg:hidden p-1.5 hover:bg-blue-700 rounded-lg transition-colors"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mt-3">
          {['all', 'active', 'closed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`flex-1 px-2 md:px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filterStatus === status
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'bg-blue-500/30 text-white hover:bg-blue-500/40'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Session Count */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex-shrink-0">
        <p className="text-xs text-gray-600">
          {filteredSessions.length} conversation{filteredSessions.length !== 1 ? 's' : ''}
          {searchQuery && ` matching "${searchQuery}"`}
        </p>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto">
        {filteredSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <MessageCircle className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mb-4" />
            <p className="text-sm md:text-base text-gray-500 font-medium mb-2">No conversations found</p>
            <p className="text-xs md:text-sm text-gray-400">
              {searchQuery ? 'Try a different search' : 'Waiting for customer messages'}
            </p>
          </div>
        ) : (
          filteredSessions.map((session) => (
            <button
              key={session._id}
              onClick={() => onSelectSession(session)}
              className={`w-full p-3 md:p-4 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                selectedSession?._id === session._id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
              }`}
            >
              {/* Session Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="relative flex-shrink-0">
                    <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {session.visitorId.substring(8, 10).toUpperCase()}
                    </div>
                    {session.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {session.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate text-xs md:text-sm">
                      Visitor {session.visitorId.substring(8, 20)}...
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(session.status)}`}>
                        {session.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Last Message */}
              {session.lastMessage && (
                <div className="mb-2">
                  <p className={`text-xs md:text-sm truncate ${
                    session.unreadCount > 0 ? 'font-semibold text-gray-900' : 'text-gray-600'
                  }`}>
                    {session.lastMessage.sender === 'admin' && (
                      <span className="text-blue-600 mr-1">You:</span>
                    )}
                    {session.lastMessage.content}
                  </p>
                </div>
              )}

              {/* Timestamp */}
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                {formatTime(session.lastMessageAt)}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default SessionList;