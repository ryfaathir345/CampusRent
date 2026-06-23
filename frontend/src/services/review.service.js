// src/services/review.service.js
import api from './api';

const reviewService = {
  createReview: async (data) => {
    const response = await api.post('/reviews', data);
    return response.data;
  },

  getUserReviews: async (userId) => {
    const response = await api.get(`/reviews/user/${userId}`);
    return response.data;
  },

  getItemReviews: async (itemId) => {
    const response = await api.get(`/reviews/item/${itemId}`);
    return response.data;
  }
};

export default reviewService;
