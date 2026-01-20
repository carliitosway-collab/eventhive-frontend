import api from "./api.service";

const userService = {
  // ❌ NO existe en tu backend: GET /api/users/:userId
  // => UserDetailsPage va a ser "lite" usando state. No pedimos al backend para evitar 404.

  getFavorites: () => api.get("/users/me/favorites"),
  addFavorite: (eventId) => api.post(`/users/me/favorites/${eventId}`),
  removeFavorite: (eventId) => api.delete(`/users/me/favorites/${eventId}`),
};

export default userService;
