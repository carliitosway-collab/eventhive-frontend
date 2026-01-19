// src/services/comments.service.js
import api from "./api.service";

const COMMENTS_BASE = "/comments";

function normalizeComment(raw = {}) {
  return {
    _id: raw._id,
    text: raw.text ?? raw.content ?? "",
    event: raw.event,
    author: raw.author,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,

    parentComment: raw.parentComment ?? null,

    likes: Array.isArray(raw.likes) ? raw.likes : [],
    likesCount: Array.isArray(raw.likes)
      ? raw.likes.length
      : (raw.likesCount ?? 0),

    replies: Array.isArray(raw.replies)
      ? raw.replies.map(normalizeComment)
      : [],
  };
}

function normalizeCommentsPayload(payload) {
  // Backend devuelve: { data: comments }
  const list = Array.isArray(payload) ? payload : payload?.data || [];
  return list.map(normalizeComment);
}

const commentsService = {
  // GET /api/comments/event/:eventId  -> { data: comments }
  getByEvent(eventId) {
    return api
      .get(`${COMMENTS_BASE}/event/${eventId}`)
      .then((res) => normalizeCommentsPayload(res.data));
  },

  // POST /api/comments  -> body: { text, eventId, parentComment? }  -> { data: createdComment }
  create(payload) {
    return api
      .post(`${COMMENTS_BASE}`, payload)
      .then((res) => normalizeComment(res.data?.data || res.data));
  },

  // POST /api/comments/:commentId/like -> { data: updatedComment }
  like(commentId) {
    return api
      .post(`${COMMENTS_BASE}/${commentId}/like`)
      .then((res) => normalizeComment(res.data?.data || res.data));
  },

  // DELETE /api/comments/:commentId/like -> { data: updatedComment }
  unlike(commentId) {
    return api
      .delete(`${COMMENTS_BASE}/${commentId}/like`)
      .then((res) => normalizeComment(res.data?.data || res.data));
  },

  // DELETE /api/comments/:commentId -> 204 No Content
  remove(commentId) {
    return api.delete(`${COMMENTS_BASE}/${commentId}`).then((res) => res.data);
  },
};

export default commentsService;
