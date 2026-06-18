import { create } from 'zustand';


const useChatStore = create((set, get) => ({
  // State
  messages: [],
  isOpen: false,
  isConnected: false,
  visitorId: null,

  // Actions
  setMessages: (messages) => set({ messages }),
  
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  
  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
  
  openChat: () => set({ isOpen: true }),
  
  closeChat: () => set({ isOpen: false }),
  
  setConnected: (isConnected) => set({ isConnected }),
  
  setVisitorId: (visitorId) => set({ visitorId }),
  
  clearMessages: () => set({ messages: [] }),

  // Get or create visitor ID
  initializeVisitorId: () => {
    let visitorId = localStorage.getItem('tradex_visitor_id');
    
    if (!visitorId) {
      visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('tradex_visitor_id', visitorId);
    }
    
    set({ visitorId });
    return visitorId;
  }
}));

export default useChatStore;