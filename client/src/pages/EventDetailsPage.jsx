import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiMapPin,
  FiCalendar,
  FiGlobe,
  FiLock,
  FiMessageCircle,
  FiLoader,
  FiTrash2,
  FiSend,
  FiEdit2,
  FiAlertTriangle,
  FiRefreshCcw,
} from "react-icons/fi";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { FiCornerUpLeft } from "react-icons/fi";

import favoritesService from "../services/favorites.service";
import commentsService from "../services/comments.service";
import eventsService from "../services/events.service";
import PageLayout from "../layouts/PageLayout";

function IconText({ icon: Icon, children, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Icon />
      {children}
    </span>
  );
}

function getNiceError(err) {
  const status = err?.response?.status;

  if (status === 401) {
    return "Your session expired or you don’t have access. Please log in again.";
  }
  if (status === 403) return "You don’t have permission to do that.";
  if (status === 404) return "Event not found.";
  if (!err?.response) return "No connection or the server is not responding.";

  return err?.response?.data?.message || "Something went wrong.";
}

function timeAgo(dateValue) {
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return "";

  const diffMs = Date.now() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return "just now";

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m`;

  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h`;

  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD}d`;

  const diffW = Math.floor(diffD / 7);
  if (diffW < 4) return `${diffW}w`;

  const diffM = Math.floor(diffD / 30);
  if (diffM < 12) return `${diffM}mo`;

  const diffY = Math.floor(diffD / 365);
  return `${diffY}y`;
}

function buildMapEmbedUrlFromLocation(location) {
  const query = String(location || "").trim();
  if (!query) return "";
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`;
}

export default function EventDetailsPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);

  // comments
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [isCommentLoading, setIsCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [togglingLikeId, setTogglingLikeId] = useState(null);

  const [replyTo, setReplyTo] = useState(null); // { id, name } | null

  // favorites
  const [favoriteIds, setFavoriteIds] = useState([]);

  // page
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // attend
  const [isAttendLoading, setIsAttendLoading] = useState(false);
  const [attendError, setAttendError] = useState("");

  // fav
  const [isFavLoading, setIsFavLoading] = useState(false);
  const [favError, setFavError] = useState("");

  // owner actions
  const [isOwnerActionLoading, setIsOwnerActionLoading] = useState(false);
  const [ownerError, setOwnerError] = useState("");

  const token = localStorage.getItem("authToken");
  const hasToken = !!token;

  const commentInputRef = useRef(null);

  // userId from JWT
  const userIdFromToken = useMemo(() => {
    if (!token) return null;

    try {
      const payloadBase64 = token.split(".")[1];
      const payloadJson = atob(
        payloadBase64.replace(/-/g, "+").replace(/_/g, "/"),
      );
      const payload = JSON.parse(payloadJson);
      return payload?._id || payload?.id || payload?.userId || null;
    } catch (e) {
      console.log("Token decode error:", e);
      return null;
    }
  }, [token]);

  // ✅ persistent like based on backend "likes" array
  const isCommentLiked = (comment) => {
    if (!userIdFromToken) return false;

    const likes = Array.isArray(comment?.likes) ? comment.likes : [];

    return likes.some((like) => {
      const likeId = typeof like === "string" ? like : like?._id;
      return String(likeId) === String(userIdFromToken);
    });
  };

  const handleToggleCommentLike = (commentId) => {
    if (!hasToken) {
      setCommentError("You must be logged in to like comments.");
      return;
    }

    const comment = comments.find((c) => String(c._id) === String(commentId));
    if (!comment) return;

    const liked = isCommentLiked(comment);

    setTogglingLikeId(commentId);
    setCommentError("");

    const req = liked
      ? commentsService.unlike(commentId)
      : commentsService.like(commentId);

    req
      .then((updated) => {
        setComments((prev) =>
          prev.map((c) => (String(c._id) === String(commentId) ? updated : c)),
        );
      })
      .catch((err) => {
        console.log(err);
        setCommentError(getNiceError(err));
      })
      .finally(() => setTogglingLikeId(null));
  };

  const openReply = (comment) => {
    const name = comment?.author?.name || comment?.author?.email || "User";
    setReplyTo({ id: comment._id, name });
    setCommentText(`@${name} `);
    setTimeout(() => commentInputRef.current?.focus(), 0);
  };

  const cancelReply = () => {
    setReplyTo(null);
    setCommentText("");
  };

  const fetchEvent = () => {
    setIsLoading(true);
    setError("");

    eventsService
      .getEventDetails(eventId)
      .then((res) => {
        const payload = res.data?.data ?? res.data;
        const eventData = payload?.event ?? payload;
        setEvent(eventData);
      })
      .catch((err) => {
        console.log(err);
        setError(getNiceError(err));
      })
      .finally(() => setIsLoading(false));
  };

  const fetchComments = () => {
    setCommentError("");

    commentsService
      .getByEvent(eventId)
      .then((list) => setComments(list))
      .catch((err) => {
        console.log(err);
        setCommentError("Could not load comments.");
      });
  };

  const fetchFavorites = () => {
    if (!hasToken) return;

    favoritesService
      .getMyFavorites()
      .then((res) => {
        const favs = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setFavoriteIds(favs.map((ev) => ev._id));
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    fetchEvent();
    fetchComments();
    fetchFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const isAttending = useMemo(() => {
    if (!event?.attendees || !userIdFromToken) return false;
    return event.attendees.some(
      (u) => String(u._id) === String(userIdFromToken),
    );
  }, [event, userIdFromToken]);

  const isFavorite = useMemo(() => {
    const currentId = event?._id;
    if (!currentId) return false;
    return favoriteIds.some((id) => String(id) === String(currentId));
  }, [favoriteIds, event?._id]);

  const isOwner = useMemo(() => {
    if (!userIdFromToken || !event?.createdBy) return false;

    const ownerId =
      typeof event.createdBy === "string"
        ? event.createdBy
        : event.createdBy?._id;

    return String(ownerId) === String(userIdFromToken);
  }, [event, userIdFromToken]);

  const dateText = useMemo(() => {
    if (!event?.date) return "No date";

    const d = new Date(event.date);
    if (Number.isNaN(d.getTime())) return "No date";

    const parts = new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).formatToParts(d);

    const get = (type) => parts.find((p) => p.type === type)?.value || "";

    const day = get("day");
    const month = get("month");
    const year = get("year");
    const hour = get("hour");
    const minute = get("minute");

    return `${day}/${month}/${year} · ${hour}:${minute}`;
  }, [event?.date]);

  const handleToggleAttend = () => {
    if (!hasToken) {
      setAttendError("You must be logged in to attend.");
      return;
    }

    setIsAttendLoading(true);
    setAttendError("");

    const request = isAttending
      ? eventsService.leaveEvent(eventId)
      : eventsService.joinEvent(eventId);

    request
      .then(() => fetchEvent())
      .catch((err) => {
        console.log(err);
        setAttendError(getNiceError(err));
      })
      .finally(() => setIsAttendLoading(false));
  };

  const handleToggleFavorite = () => {
    if (!hasToken) {
      setFavError("You must be logged in to save favorites.");
      return;
    }

    setIsFavLoading(true);
    setFavError("");

    const targetId = event?._id || eventId;

    const request = isFavorite
      ? favoritesService.removeFavorite(targetId)
      : favoritesService.addFavorite(targetId);

    request
      .then(() => fetchFavorites())
      .catch((err) => {
        console.log(err);
        setFavError(getNiceError(err));
      })
      .finally(() => setIsFavLoading(false));
  };

  const handleCreateComment = (e) => {
    e.preventDefault();

    if (!hasToken) {
      setCommentError("You must be logged in to comment.");
      return;
    }

    const clean = commentText.trim();
    if (!clean) {
      setCommentError("Write something before sending.");
      return;
    }

    setIsCommentLoading(true);
    setCommentError("");

    commentsService
      .create({ text: clean, eventId })
      .then(() => {
        setCommentText("");
        setReplyTo(null);
        fetchComments();
      })
      .catch((err) => {
        console.log(err);
        setCommentError(getNiceError(err));
      })
      .finally(() => setIsCommentLoading(false));
  };

  const handleDeleteComment = (commentId) => {
    if (!hasToken) {
      setCommentError("You must be logged in.");
      return;
    }

    commentsService
      .remove(commentId)
      .then(() => {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
      })
      .catch((err) => {
        console.log(err);
        setCommentError(getNiceError(err));
      });
  };

  const handleDeleteEvent = () => {
    setOwnerError("");

    if (!hasToken) {
      setOwnerError("You must be logged in.");
      return;
    }

    if (!isOwner) {
      setOwnerError("You don’t have permission to delete this event.");
      return;
    }

    const ok = window.confirm(
      "Are you sure you want to delete this event? This cannot be undone.",
    );
    if (!ok) return;

    setIsOwnerActionLoading(true);

    eventsService
      .deleteEvent(eventId)
      .then(() => navigate("/my-events"))
      .catch((err) => {
        console.log(err);
        setOwnerError(getNiceError(err));
      })
      .finally(() => setIsOwnerActionLoading(false));
  };

  const handleRefresh = () => {
    fetchEvent();
    fetchComments();
    fetchFavorites();
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/events"
            className="btn btn-ghost btn-sm border border-base-300 gap-2"
          >
            <FiArrowLeft />
            Back
          </Link>

          <button
            type="button"
            className="btn btn-ghost btn-sm border border-base-300 gap-2"
            disabled
          >
            <FiRefreshCcw />
            Refresh
          </button>
        </div>

        <header className="mt-4 mb-6">
          <h1 className="text-4xl font-black">Event Details</h1>
          <p className="opacity-70 mt-2">Loading event…</p>
        </header>

        <p className="opacity-75">
          <IconText icon={FiLoader}>Loading…</IconText>
        </p>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/events"
            className="btn btn-ghost btn-sm border border-base-300 gap-2"
          >
            <FiArrowLeft />
            Back
          </Link>

          <button
            type="button"
            onClick={handleRefresh}
            className="btn btn-ghost btn-sm border border-base-300 gap-2"
          >
            <FiRefreshCcw />
            Refresh
          </button>
        </div>

        <header className="mt-4 mb-6">
          <h1 className="text-4xl font-black">Event Details</h1>
        </header>

        <div className="alert alert-error">
          <IconText icon={FiAlertTriangle}>{error}</IconText>
        </div>
      </PageLayout>
    );
  }

  if (!event) {
    return (
      <PageLayout>
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/events"
            className="btn btn-ghost btn-sm border border-base-300 gap-2"
          >
            <FiArrowLeft />
            Back
          </Link>

          <button
            type="button"
            onClick={handleRefresh}
            className="btn btn-ghost btn-sm border border-base-300 gap-2"
          >
            <FiRefreshCcw />
            Refresh
          </button>
        </div>

        <header className="mt-4 mb-2">
          <h1 className="text-4xl font-black">Event Details</h1>
        </header>

        <p className="opacity-75">Event not found.</p>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/events"
          className="btn btn-ghost btn-sm border border-base-300 gap-2"
        >
          <FiArrowLeft />
          Back
        </Link>

        <button
          type="button"
          onClick={handleRefresh}
          className="btn btn-ghost btn-sm border border-base-300 gap-2"
          disabled={
            isAttendLoading ||
            isFavLoading ||
            isOwnerActionLoading ||
            isCommentLoading ||
            !!togglingLikeId
          }
        >
          <FiRefreshCcw />
          Refresh
        </button>
      </div>

      <header className="mt-4 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-4xl md:text-5xl font-black break-words">
              {event.title || "Untitled event"}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium shadow-sm ${
                  event.isPublic
                    ? "border-base-300"
                    : "border-base-300 bg-base-200/70"
                }`}
              >
                <IconText icon={event.isPublic ? FiGlobe : FiLock}>
                  {event.isPublic ? "Public" : "Private"}
                </IconText>
              </span>

              <span className="inline-flex items-center gap-2 rounded-full border border-base-300 px-4 py-1.5 text-sm font-medium shadow-sm">
                <IconText icon={FiCalendar}>{dateText}</IconText>
              </span>

              <span className="inline-flex items-center gap-2 rounded-full border border-base-300 px-4 py-1.5 text-sm font-medium shadow-sm">
                <IconText icon={FiMapPin}>
                  {event.location || "No location"}
                </IconText>
              </span>

              <button
                type="button"
                onClick={handleToggleAttend}
                className="inline-flex items-center gap-2 rounded-full border border-base-300 px-4 py-1.5 text-sm font-medium shadow-sm hover:bg-base-200 transition"
              >
                Attend
              </button>

              <button
                type="button"
                onClick={handleToggleFavorite}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium shadow-sm transition ${
                  isFavorite
                    ? "bg-base-200 border-base-300"
                    : "border-base-300 hover:bg-base-200"
                }`}
              >
                {isFavorite ? "Saved" : "Save"}
              </button>
            </div>

            {attendError && (
              <div className="alert alert-error mt-4">
                <IconText icon={FiAlertTriangle}>{attendError}</IconText>
              </div>
            )}

            {favError && (
              <div className="alert alert-error mt-4">
                <IconText icon={FiAlertTriangle}>{favError}</IconText>
              </div>
            )}
          </div>

          {event.createdBy && (
            <div className="text-sm opacity-75">
              <span className="font-semibold">Created by:</span>{" "}
              {event.createdBy.name || event.createdBy.email || "—"}
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <section className="lg:col-span-12">
          <div className="card bg-base-100 border border-base-300 rounded-2xl shadow-sm">
            <div className="card-body gap-6">
              <div className="grid gap-2">
                <h2 className="text-lg font-extrabold inline-flex items-center gap-2">
                  <FiMessageCircle />
                  About this event
                </h2>

                <p className="text-base opacity-80 leading-relaxed max-w-prose">
                  {event.description || "No description."}
                </p>
              </div>

              {isOwner && (
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    to={`/events/edit/${eventId}`}
                    className="btn btn-outline gap-2"
                  >
                    <FiEdit2 />
                    Edit
                  </Link>

                  <button
                    type="button"
                    onClick={handleDeleteEvent}
                    disabled={isOwnerActionLoading}
                    className="btn btn-error gap-2"
                  >
                    {isOwnerActionLoading ? (
                      <>
                        <span className="loading loading-spinner loading-sm" />
                        Deleting…
                      </>
                    ) : (
                      <>
                        <FiTrash2 />
                        Delete
                      </>
                    )}
                  </button>
                </div>
              )}

              {ownerError && (
                <div className="alert alert-error">
                  <IconText icon={FiAlertTriangle}>{ownerError}</IconText>
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="mt-6 card bg-base-100 border border-base-300 rounded-2xl shadow-sm">
            <div className="card-body gap-4">
              <h2 className="text-lg font-extrabold inline-flex items-center gap-2">
                <FiMapPin />
                Location
              </h2>

              <p className="text-sm opacity-80">
                {event.location || "No location."}
              </p>

              {buildMapEmbedUrlFromLocation(event.location) ? (
                <div className="overflow-hidden rounded-2xl border border-base-300">
                  <iframe
                    title="Google Map"
                    src={buildMapEmbedUrlFromLocation(event.location)}
                    className="w-full h-80"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              ) : (
                <p className="text-sm opacity-70">Map not available.</p>
              )}
            </div>
          </div>

          {/* Comments */}
          <div className="mt-6 card bg-base-100 border border-base-300 rounded-2xl shadow-sm">
            <div className="card-body">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-extrabold inline-flex items-center gap-2">
                  <FiMessageCircle />
                  Comments{" "}
                  <span className="text-sm font-semibold opacity-60">
                    ({comments.length})
                  </span>
                </h2>
              </div>

              {replyTo && (
                <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-base-300 bg-base-100 px-4 py-2 text-sm">
                  <div className="opacity-80">
                    Replying to{" "}
                    <span className="font-semibold">{replyTo.name}</span>
                  </div>

                  <button
                    type="button"
                    onClick={cancelReply}
                    className="btn btn-ghost btn-xs"
                  >
                    Cancel
                  </button>
                </div>
              )}

              <form
                onSubmit={handleCreateComment}
                className="mt-4 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end"
              >
                <textarea
                  ref={commentInputRef}
                  className="w-full rounded-2xl border border-base-300 bg-base-100 px-4 py-3 text-sm placeholder:opacity-60 transition duration-200 focus:border-base-300 focus:outline-none focus:ring-0 focus:bg-base-100 hover:bg-base-200/30"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={
                    hasToken ? "Write a comment..." : "Log in to comment"
                  }
                  disabled={!hasToken || isCommentLoading}
                  rows={3}
                />

                <div className="flex items-center justify-end gap-3 md:self-end">
                  {!hasToken && (
                    <span className="text-xs opacity-60 mr-auto md:hidden">
                      Log in to comment.
                    </span>
                  )}

                  <button
                    type="submit"
                    disabled={!hasToken || isCommentLoading}
                    className="btn rounded-2xl h-11 min-h-11 px-5 w-full md:w-fit gap-2 bg-base-200 border border-base-300 text-base-content font-medium shadow-sm hover:shadow-md hover:bg-base-300 transition active:scale-[0.98]"
                  >
                    {isCommentLoading ? (
                      <span className="loading loading-spinner loading-sm" />
                    ) : (
                      <>
                        <FiSend className="text-base" />
                        <span className="text-sm font-medium">Send</span>
                      </>
                    )}
                  </button>
                </div>

                {!hasToken && (
                  <span className="text-xs opacity-60 hidden md:block md:col-span-2">
                    Log in to comment.
                  </span>
                )}
              </form>

              {commentError && (
                <div className="alert alert-error mt-4">
                  <IconText icon={FiAlertTriangle}>{commentError}</IconText>
                </div>
              )}

              <div className="mt-5">
                {comments.length === 0 ? (
                  <p className="opacity-75">No comments yet.</p>
                ) : (
                  <div className="grid gap-3">
                    {comments.map((c) => {
                      const isMine =
                        userIdFromToken &&
                        String(c?.author?._id) === String(userIdFromToken);

                      const when = c?.createdAt ? timeAgo(c.createdAt) : "";

                      const liked = isCommentLiked(c);

                      return (
                        <div
                          key={c._id}
                          className="border border-base-300 rounded-xl bg-base-100 px-4 py-3 shadow-sm hover:bg-base-200/30 transition"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <div className="font-semibold text-sm truncate">
                                  {c?.author?.name ||
                                    c?.author?.email ||
                                    "User"}
                                </div>

                                {when && (
                                  <div className="text-xs opacity-60">
                                    {when}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openReply(c)}
                                className="btn btn-ghost btn-xs btn-circle border border-base-300 bg-base-100 shadow-sm text-base-content/70 hover:bg-base-200/50 hover:text-base-content"
                                title="Reply"
                                aria-label="Reply"
                              >
                                <FiCornerUpLeft size={15} />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleToggleCommentLike(c._id)}
                                disabled={togglingLikeId === c._id}
                                className={`btn btn-ghost btn-xs btn-circle border border-base-300 bg-base-100 shadow-sm hover:bg-base-200/50 ${
                                  liked
                                    ? "text-red-500"
                                    : "text-base-content/70 hover:text-base-content"
                                }`}
                                title={liked ? "Unlike" : "Like"}
                                aria-label={liked ? "Unlike" : "Like"}
                              >
                                {togglingLikeId === c._id ? (
                                  <span className="loading loading-spinner loading-xs" />
                                ) : liked ? (
                                  <AiFillHeart size={16} />
                                ) : (
                                  <AiOutlineHeart size={16} />
                                )}
                              </button>

                              {isMine && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteComment(c._id)}
                                  className="btn btn-ghost btn-xs btn-circle border border-base-300 bg-base-100 shadow-sm text-base-content/70 hover:bg-base-200/50 hover:text-base-content"
                                  title="Delete comment"
                                  aria-label="Delete comment"
                                >
                                  <FiTrash2 />
                                </button>
                              )}
                            </div>
                          </div>

                          <p className="mt-2 text-sm leading-relaxed opacity-85">
                            {c.text}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
