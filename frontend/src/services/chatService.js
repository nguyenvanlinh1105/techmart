import api from './api';

export const chatService = {
  // Get or create conversation
  getMyConversation: async () => {
    const response = await api.get('/chat/conversations/my');
    return response.data;
  },

  // Get messages
  getMessages: async (conversationId, limit = 50, before = null) => {
    const params = { limit };
    if (before) params.before = before;
    
    const response = await api.get(`/chat/messages/${conversationId}`, { params });
    return response.data;
  },

  // Send message
  sendMessage: async (conversationId, content, messageType = 'text', image = null) => {
    const formData = new FormData();
    formData.append('conversation_id', conversationId);
    formData.append('content', content);
    formData.append('message_type', messageType);
    
    if (image) {
      formData.append('image', image);
    }
    
    const response = await api.post('/chat/messages', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Admin: Get all conversations
  adminGetConversations: async (status = null) => {
    const params = status ? { status } : {};
    const response = await api.get('/chat/admin/conversations', { params });
    return response.data;
  },

  // Admin: Get messages
  adminGetMessages: async (conversationId, limit = 50) => {
    const response = await api.get(`/chat/admin/messages/${conversationId}`, {
      params: { limit }
    });
    return response.data;
  },

  // Admin: Send message
  adminSendMessage: async (conversationId, content, messageType = 'text', image = null) => {
    const formData = new FormData();
    formData.append('conversation_id', conversationId);
    formData.append('content', content);
    formData.append('message_type', messageType);
    
    if (image) {
      formData.append('image', image);
    }
    
    const response = await api.post('/chat/admin/messages', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Admin: Update conversation status
  adminUpdateStatus: async (conversationId, status) => {
    const response = await api.put(`/chat/admin/conversations/${conversationId}/status`, 
      null, 
      { params: { status } }
    );
    return response.data;
  }
};
