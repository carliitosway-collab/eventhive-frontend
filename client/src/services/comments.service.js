import api from "./api.service";

const commentsService = {
  getByEvent: (eventId) => api.get(`/comments/event/${eventId}`),
  create: (requestBody) => api.post("/comments", requestBody), // { text, eventId }
  remove: (commentId) => api.delete(`/comments/${commentId}`),
};

export default commentsService;
