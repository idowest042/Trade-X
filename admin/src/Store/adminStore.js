import { create } from 'zustand';

const useAdminStore = create((set, get) => ({
  // State
  sessions: [],
  selectedSession: null,
  messages: [],
  isConnected: false,
  unreadCount: 0,
  isLoading: false,
  searchQuery: '',
  filterStatus: 'all', // 'all', 'active', 'closed'

  // Actions
  setSessions: (sessions) => set({ sessions }),

  setSelectedSession: (session) => set({ 
    selectedSession: session,
    messages: [] // Clear messages when switching sessions
  }),

  setMessages: (messages) => set({ messages }),

  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),

  updateSession: (sessionId, updates) => set((state) => ({
    sessions: state.sessions.map(session =>
      session._id === sessionId ? { ...session, ...updates } : session
    )
  })),

  setConnected: (isConnected) => set({ isConnected }),

  setLoading: (isLoading) => set({ isLoading }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setFilterStatus: (status) => set({ filterStatus: status }),

  // Calculate total unread messages across all sessions
  calculateUnreadCount: () => {
    const { sessions } = get();
    const total = sessions.reduce((sum, session) => sum + (session.unreadCount || 0), 0);
    set({ unreadCount: total });
  },

  // Mark session messages as read
  markSessionAsRead: (sessionId) => set((state) => ({
    sessions: state.sessions.map(session =>
      session._id === sessionId ? { ...session, unreadCount: 0 } : session
    )
  })),

  // Get filtered sessions based on search and filter
  getFilteredSessions: () => {
    const { sessions, searchQuery, filterStatus } = get();
    
    let filtered = sessions;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(session => session.status === filterStatus);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(session =>
        session.visitorId.toLowerCase().includes(query) ||
        session.lastMessage?.content?.toLowerCase().includes(query)
      );
    }

    return filtered;
  },

  // Clear all data (logout)
  clearStore: () => set({
    sessions: [],
    selectedSession: null,
    messages: [],
    isConnected: false,
    unreadCount: 0,
    searchQuery: '',
    filterStatus: 'all'
  })
}));

export default useAdminStore;