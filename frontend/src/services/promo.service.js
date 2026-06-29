import api from './api';

class PromoService {
  getPromos() {
    return api.get('/promos');
  }

  getActivePromos() {
    return api.get('/promos/active');
  }

  validatePromo(code) {
    return api.post('/promos/validate', { code });
  }

  createPromo(promoData) {
    return api.post('/promos', promoData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  updatePromo(id, promoData) {
    return api.put(`/promos/${id}`, promoData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  deletePromo(id) {
    return api.delete(`/promos/${id}`);
  }
}

export default new PromoService();
