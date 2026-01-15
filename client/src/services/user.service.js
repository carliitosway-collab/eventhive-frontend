import api from "./api.service";

const userService = {
  // Si luego agregas /users/me o perfil, va aquí.
  // Por ahora: dejamos favoritos correcto para no romper nada si lo estabas usando.

  getFavorites: () => api.get("/users/me/favorites"),
  addFavorite: (eventId) => api.post(`/users/me/favorites/${eventId}`),
  removeFavorite: (eventId) => api.delete(`/users/me/favorites/${eventId}`),
};

export default userService;
