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
  },

  deleteMessage: async (transactionId, messageId) => {
    const response = await api.delete(`/chat/${transactionId}/messages/${messageId}`);
    return response.data;
  },

  markAsRead: async (transactionId) => {
    const response = await api.put(`/chat/${transactionId}/messages/read`);
    return response.data;
  }
};

export default chatService;
