import api from './api';

const categoryService = {
  getCategories: () => api.get('/categories'),
  createCategory: (data) => api.post('/categories', data),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
};

export default categoryService;
