import api from './api';

const wishlistService = {
  getWishlists: async () => {
    const response = await api.get('/wishlists');
    return response.data;
  },

  toggleWishlist: async (itemId) => {
    const response = await api.post(`/wishlists/${itemId}`);
    return response.data;
  }
};

export default wishlistService;
