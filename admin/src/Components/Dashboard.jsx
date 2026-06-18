import React, { useEffect, useState, useRef } from 'react';
import {
  Send, User, AlertCircle, CheckCircle, Clock, X, Menu,
  Wifi, WifiOff, RefreshCw, MessageSquare, Circle,
} from 'lucide-react';
import { format } from 'date-fns';
import useAdminStore from '../Store/adminStore';
import adminSocketService from '../Store/adminSocketService';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtTime = (ts) => {
  if (!ts) return '';
  try { return format(new Date(ts), 'h:mm a'); } catch { return ''; }
};

const fmtDate = (ts) => {
  if (!ts) return '';
  try {
    const d = new Date(ts);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return format(d, 'MMM d, yyyy');
  } catch { return ''; }
};

const avatar = (id = '') => id.substring(8, 10).toUpperCase() || 'VI';
const shortId = (id = '') => id.substring(8, 20);

// ─── Session Item ─────────────────────────────────────────────────────────────
function SessionItem({ session, isSelected, onClick }) {
  const last = session.lastMessage?.content || 'No messages yet';
  const unread = session.unreadCount || 0;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3.5 border-b border-gray-100 transition-colors hover:bg-blue-50/60
        ${isSelected ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'border-l-4 border-l-transparent'}`}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-bold">
            {avatar(session.visitorId)}
          </div>
          {session.status === 'active' && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <p className="text-sm font-semibold text-gray-900 truncate">
              Visitor {shortId(session.visitorId)}
            </p>
            <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">
              {session.lastMessageAt ? fmtTime(session.lastMessageAt) : ''}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 truncate max-w-[160px]">{last}</p>
            {unread > 0 && (
              <span className="flex-shrink-0 ml-2 w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
function MessageBubble({ message, prevMessage }) {
  const isAdmin   = message.sender === 'admin';
  const isSystem  = message.sender === 'system';
  const showDate  = !prevMessage || fmtDate(prevMessage?.createdAt) !== fmtDate(message.createdAt);

  return (
    <>
      {showDate && (
        <div className="flex items-center justify-center my-4">
          <span className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">
            {fmtDate(message.createdAt)}
          </span>
        </div>
      )}

      {isSystem ? (
        <div className="flex justify-center my-2">
          <span className="bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs px-3 py-1.5 rounded-full">
            {message.content}
          </span>
        </div>
      ) : (
        <div className={`flex ${isAdmin ? 'justify-end' : 'justify-start'} mb-1`}>
          <div className={`max-w-[75%] md:max-w-[65%]`}>
            <p className={`text-[11px] font-semibold mb-1 px-1 ${isAdmin ? 'text-blue-500 text-right' : 'text-gray-500'}`}>
              {isAdmin ? 'You' : `Visitor ${shortId(message.sessionId || '')}`}
            </p>
            <div className={`rounded-2xl px-4 py-2.5 ${
              isAdmin
                ? 'bg-blue-600 text-white rounded-tr-none'
                : 'bg-white text-gray-900 border border-gray-200 rounded-tl-none shadow-sm'
            }`}>
              <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                {message.content}
              </p>
              <div className={`flex items-center gap-1 mt-1.5 text-[10px] ${isAdmin ? 'text-blue-200 justify-end' : 'text-gray-400'}`}>
                <Clock className="w-2.5 h-2.5" />
                {fmtTime(message.createdAt)}
                {isAdmin && (
                  <span className="ml-0.5 flex">
                    <CheckCircle className="w-2.5 h-2.5" />
                    <CheckCircle className="w-2.5 h-2.5 -ml-1" />
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Chat Area ────────────────────────────────────────────────────────────────
function ChatArea({ session, onOpenSidebar }) {
  const { messages, addMessage, markSessionAsRead } = useAdminStore();
  const [input, setInput]       = useState('');
  const [sending, setSending]   = useState(false);
  const bottomRef               = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (session) markSessionAsRead(session._id);
  }, [session, messages.length, markSessionAsRead]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !session || sending) return;
    setSending(true);
    try {
      adminSocketService.sendMessage(session.visitorId, input.trim());
      setInput('');
    } catch (err) {
      console.error('Send error:', err);
    } finally {
      setSending(false);
    }
  };

  if (!session) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-center px-6">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
          <MessageSquare className="w-8 h-8 text-blue-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-1">No conversation selected</h3>
        <p className="text-sm text-gray-500 max-w-xs">
          Select a conversation from the sidebar to view messages and respond.
        </p>
        {onOpenSidebar && (
          <button onClick={onOpenSidebar}
            className="mt-5 lg:hidden flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
            <Menu className="w-4 h-4" />
            View Conversations
          </button>
        )}
      </div>
    );
  }

  const isClosed = session.status === 'closed';

  return (
    <div className="flex-1 flex flex-col bg-white h-full min-h-0">
      {/* Header */}
      <div className="px-4 md:px-5 py-3.5 border-b border-gray-100 bg-white flex items-center justify-between flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          {onOpenSidebar && (
            <button onClick={onOpenSidebar} className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg flex-shrink-0">
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          )}
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-bold">
              {avatar(session.visitorId)}
            </div>
            {session.status === 'active' && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-900 text-sm truncate">
              Visitor {shortId(session.visitorId)}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full
                ${session.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                {session.status}
              </span>
              <span className="text-[10px] text-gray-400 hidden sm:inline truncate">
                ID: {session.visitorId?.substring(0, 20)}
              </span>
            </div>
          </div>
        </div>
        <button onClick={() => console.log('close', session._id)}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          title="Close conversation">
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-5 py-4 bg-gray-50 space-y-0.5">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <MessageSquare className="w-10 h-10 text-gray-300 mb-2" />
            <p className="text-sm text-gray-400">No messages yet in this conversation.</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <MessageBubble key={msg._id || i} message={msg} prevMessage={messages[i - 1]} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend}
        className="px-4 md:px-5 py-3.5 bg-white border-t border-gray-100 flex gap-2.5 flex-shrink-0">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={isClosed ? 'Conversation is closed' : 'Type your response…'}
          disabled={sending || isClosed}
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <button type="submit"
          disabled={!input.trim() || sending || isClosed}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
      {isClosed && (
        <p className="text-center text-xs text-gray-400 pb-2 bg-white">
          This conversation is closed.
        </p>
      )}
    </div>
  );
}

// ─── Session List Panel ───────────────────────────────────────────────────────
function SessionList({ onSelectSession, onClose }) {
  const { sessions, selectedSession } = useAdminStore();
  const [search, setSearch] = useState('');

  const filtered = sessions.filter(s =>
    !search || s.visitorId?.toLowerCase().includes(search.toLowerCase())
  );

  const active   = sessions.filter(s => s.status === 'active').length;
  const total    = sessions.length;

  return (
    <div className="w-full h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Panel Header */}
      <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
        <div>
          <p className="font-bold text-gray-900">Conversations</p>
          <p className="text-xs text-gray-500 mt-0.5">{active} active · {total} total</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>

      {/* Search */}
      <div className="px-4 py-3 border-b border-gray-100 flex-shrink-0">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by visitor ID…"
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-gray-400">
            <Circle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">{sessions.length === 0 ? 'No conversations yet.' : 'No matches found.'}</p>
          </div>
        ) : (
          filtered.map(s => (
            <SessionItem
              key={s._id}
              session={s}
              isSelected={selectedSession?._id === s._id}
              onClick={() => onSelectSession(s)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const Dashboard = () => {
  const {
    sessions, selectedSession, isConnected,
    setSessions, setSelectedSession, setMessages, addMessage,
    setConnected, updateSession, calculateUnreadCount, markSessionAsRead,
  } = useAdminStore();

  const [connectionError, setConnectionError] = useState(null);
  const [initializing,    setInitializing]    = useState(true);
  const [sidebarOpen,     setSidebarOpen]     = useState(false);

  useEffect(() => {
    initDashboard();
    return () => adminSocketService.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initDashboard = () => {
    setInitializing(true);
    setConnectionError(null);

    const socket = adminSocketService.connect('http://localhost:5000');

    socket.on('connect', () => {
      setConnected(true);
      setConnectionError(null);
      setInitializing(false);
      adminSocketService.getSessions();
    });

    socket.on('disconnect', () => setConnected(false));

    socket.on('connect_error', () => {
      setConnected(false);
      setConnectionError('Cannot connect to server. Make sure the backend is running on port 5000.');
      setInitializing(false);
    });

    socket.on('admin:sessions', (loaded) => {
      setSessions(loaded);
      calculateUnreadCount();
    });

    socket.on('admin:messages', (loaded) => setMessages(loaded));

    socket.on('admin:newMessage', ({ sessionId, visitorId, message }) => {
      if (selectedSession?.visitorId === visitorId) {
        addMessage(message);
        markSessionAsRead(sessionId);
      }
      updateSession(sessionId, { lastMessageAt: message.createdAt, lastMessage: message });
      adminSocketService.getSessions();
    });

    socket.on('admin:messageUpdate', ({ sessionId, visitorId, message }) => {
      if (selectedSession?.visitorId === visitorId) addMessage(message);
      updateSession(sessionId, { lastMessageAt: message.createdAt, lastMessage: message });
    });

    socket.on('admin:messageSent', (message) => addMessage(message));
    socket.on('chat:error', (err) => setConnectionError(err.message));
  };

  const handleSelectSession = (session) => {
    setSelectedSession(session);
    adminSocketService.getMessages(session.visitorId);
    setSidebarOpen(false);
  };
  
  const handleRefresh = () => {
    adminSocketService.getSessions();
    if (selectedSession) adminSocketService.getMessages(selectedSession.visitorId);
  };

  if (initializing) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <RefreshCw className="w-10 h-10 text-blue-600 mx-auto mb-3 animate-spin" />
          <p className="text-base font-semibold text-gray-800">Connecting to server…</p>
          <p className="text-sm text-gray-500 mt-1">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 shadow-sm flex-shrink-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(v => !v)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Menu className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-gray-900">Support Chat</h1>
              <p className="text-xs text-gray-500 hidden sm:block">TradeX Customer Support</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border
              ${isConnected ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
              {isConnected
                ? <><Wifi className="w-3.5 h-3.5" /><span className="hidden sm:inline">Connected</span></>
                : <><WifiOff className="w-3.5 h-3.5" /><span className="hidden sm:inline">Offline</span></>}
            </div>
            <button onClick={handleRefresh} disabled={!isConnected}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error banner */}
      {connectionError && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2.5 flex-shrink-0 flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700 flex-1 truncate">{connectionError}</p>
          <button onClick={initDashboard} className="text-xs font-semibold text-red-700 hover:underline whitespace-nowrap">
            Retry
          </button>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Session sidebar */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-80 transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          flex-shrink-0
        `}>
          <SessionList
            onSelectSession={handleSelectSession}
            onClose={() => setSidebarOpen(false)}
          />
        </div>

        {/* Chat */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <ChatArea
            session={selectedSession}
            onOpenSidebar={() => setSidebarOpen(true)}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;