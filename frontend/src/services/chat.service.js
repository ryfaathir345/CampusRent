// src/services/chat.service.js
import api from './api';

const chatService = {
  getConversations: async () => {
    const response = await api.get('/chat/conversations');
    return response.data;
  },

  getMessages: async (transactionId) => {
    const response = await api.get(`/chat/${transactionId}/messages`);
    return response.data;
  },

  sendMessage: async (transactionId, data) => {
    const response = await api.post(`/chat/${transactionId}/messages`, data);
    return response.data;
  }
};

export default chatService;
