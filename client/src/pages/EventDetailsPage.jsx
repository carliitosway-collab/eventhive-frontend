import { useEffect, useMemo, useState } from "react";
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

  if (status === 401) return "Your session expired or you don’t have access. Please log in again.";
  if (status === 403) return "You don’t have permission to do that.";
  if (status === 404) return "Event not found.";
  if (!err?.response) return "No connection or the server is not responding.";

  return err?.response?.data?.message || "Something went wrong.";
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

  // userId from JWT
  const userIdFromToken = useMemo(() => {
    if (!token) return null;
    try {
      const payloadBase64 = token.split(".")[1];
      const payloadJson = atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"));
      const payload = JSON.parse(payloadJson);
      return payload?._id || payload?.id || payload?.userId || null;
    } catch (e) {
      console.log("Token decode error:", e);
      return null;
    }
  }, [token]);

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
      .then((res) => setComments(res.data?.data || []))
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
    return event.attendees.some((u) => String(u._id) === String(userIdFromToken));
  }, [event, userIdFromToken]);

  const isFavorite = useMemo(() => {
    const currentId = event?._id;
    if (!currentId) return false;
    return favoriteIds.some((id) => String(id) === String(currentId));
  }, [favoriteIds, event?._id]);

  const isOwner = useMemo(() => {
    if (!userIdFromToken || !event?.createdBy) return false;
    const ownerId = typeof event.createdBy === "string" ? event.createdBy : event.createdBy?._id;
    return String(ownerId) === String(userIdFromToken);
  }, [event, userIdFromToken]);

  const dateText = event?.date ? new Date(event.date).toLocaleString() : "No date";

  const handleToggleAttend = () => {
    if (!hasToken) {
      setAttendError("You must be logged in to attend.");
      return;
    }

    setIsAttendLoading(true);
    setAttendError("");

    const request = isAttending ? eventsService.leaveEvent(eventId) : eventsService.joinEvent(eventId);

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
      .then(() => setComments((prev) => prev.filter((c) => c._id !== commentId)))
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

    const ok = window.confirm("Are you sure you want to delete this event? This cannot be undone.");
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

  // LOADING
  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-between gap-4">
          <Link to="/events" className="btn btn-ghost btn-sm border border-base-300 gap-2">
            <FiArrowLeft />
            Back
          </Link>

          <button type="button" className="btn btn-ghost btn-sm border border-base-300 gap-2" disabled>
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

  // ERROR
  if (error) {
    return (
      <PageLayout>
        <div className="flex items-center justify-between gap-4">
          <Link to="/events" className="btn btn-ghost btn-sm border border-base-300 gap-2">
            <FiArrowLeft />
            Back
          </Link>

          <button type="button" onClick={handleRefresh} className="btn btn-ghost btn-sm border border-base-300 gap-2">
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

  // NO EVENT
  if (!event) {
    return (
      <PageLayout>
        <div className="flex items-center justify-between gap-4">
          <Link to="/events" className="btn btn-ghost btn-sm border border-base-300 gap-2">
            <FiArrowLeft />
            Back
          </Link>

          <button type="button" onClick={handleRefresh} className="btn btn-ghost btn-sm border border-base-300 gap-2">
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
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4">
        <Link to="/events" className="btn btn-ghost btn-sm border border-base-300 gap-2">
          <FiArrowLeft />
          Back
        </Link>

        <button
          type="button"
          onClick={handleRefresh}
          className="btn btn-ghost btn-sm border border-base-300 gap-2"
          disabled={isAttendLoading || isFavLoading || isOwnerActionLoading || isCommentLoading}
        >
          <FiRefreshCcw />
          Refresh
        </button>
      </div>

      {/* Header */}
      <header className="mt-4 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-4xl md:text-5xl font-black break-words">
              {event.title || "Untitled event"}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className={`badge ${event.isPublic ? "badge-outline" : "badge-neutral"}`}>
                <IconText icon={event.isPublic ? FiGlobe : FiLock}>
                  {event.isPublic ? "Public" : "Private"}
                </IconText>
              </span>

              <span className="badge badge-outline">
                <IconText icon={FiCalendar}>{dateText}</IconText>
              </span>

              <span className="badge badge-outline">
                <IconText icon={FiMapPin}>{event.location || "No location"}</IconText>
              </span>
            </div>
          </div>

          {event.createdBy && (
            <div className="text-sm opacity-75">
              <span className="font-semibold">Created by:</span>{" "}
              {event.createdBy.name || event.createdBy.email || "—"}
            </div>
          )}
        </div>
      </header>

      {/* Layout: main + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main */}
        <section className="lg:col-span-8">
          <div className="card bg-base-100 border border-base-300 rounded-2xl shadow-sm">
            <div className="card-body gap-6">
              <div>
                <h2 className="text-lg font-extrabold mb-2">About this event</h2>
                <p className="opacity-85 leading-relaxed">
                  {event.description || "No description."}
                </p>
              </div>

              {/* Owner actions inside main content */}
              {isOwner && (
                <div className="flex flex-wrap items-center gap-3">
                  <Link to={`/events/edit/${eventId}`} className="btn btn-outline gap-2">
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

          {/* Comments */}
          <div className="mt-6 card bg-base-100 border border-base-300 rounded-2xl shadow-sm">
            <div className="card-body">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-extrabold inline-flex items-center gap-2">
                  <FiMessageCircle />
                  Comments <span className="opacity-75">({comments.length})</span>
                </h2>
              </div>

              <form onSubmit={handleCreateComment} className="mt-4 grid gap-3">
                <textarea
                  className="textarea textarea-bordered w-full"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={hasToken ? "Write a comment..." : "Log in to comment"}
                  disabled={!hasToken || isCommentLoading}
                  rows={3}
                />

                <button
                  type="submit"
                  disabled={!hasToken || isCommentLoading}
                  className="btn btn-primary w-fit gap-2 shadow-md hover:shadow-lg transition active:scale-[0.98]"
                >
                  {isCommentLoading ? (
                    <>
                      <span className="loading loading-spinner loading-sm" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <FiSend />
                      Send
                    </>
                  )}
                </button>
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
                        userIdFromToken && String(c?.author?._id) === String(userIdFromToken);
                      const when = c?.createdAt ? new Date(c.createdAt).toLocaleString() : "";

                      return (
                        <div key={c._id} className="card bg-base-100 border border-base-300 rounded-xl">
                          <div className="card-body p-4">
                            <div className="flex justify-between gap-4">
                              <div className="opacity-85">
                                <div className="font-bold text-sm">
                                  {c?.author?.name || c?.author?.email || "User"}
                                </div>
                                <div className="text-xs opacity-70">{when}</div>
                              </div>

                              {isMine && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteComment(c._id)}
                                  className="btn btn-ghost btn-sm"
                                  title="Delete comment"
                                  aria-label="Delete comment"
                                >
                                  <FiTrash2 />
                                </button>
                              )}
                            </div>

                            <p className="mt-3 opacity-85 leading-relaxed">{c.text}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Sidebar */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24">
          <div className="card bg-base-100 border border-base-300 rounded-2xl shadow-sm">
            <div className="card-body gap-4">
              <div className="flex items-center justify-between">
                <div className="text-sm opacity-75">Attendees</div>
                <div className="text-2xl font-black">{event.attendees?.length || 0}</div>
              </div>

              <div className="grid gap-2">
                <button
                  type="button"
                  onClick={handleToggleAttend}
                  disabled={!hasToken || isAttendLoading}
                  className="btn btn-primary w-full gap-2 shadow-md hover:shadow-lg transition active:scale-[0.98]"
                >
                  {isAttendLoading ? (
                    <>
                      <span className="loading loading-spinner loading-sm" />
                      Processing…
                    </>
                  ) : isAttending ? (
                    "Leave"
                  ) : (
                    "Attend"
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleToggleFavorite}
                  disabled={!hasToken || isFavLoading}
                  className="btn btn-outline w-full gap-2"
                  aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                  title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  {isFavLoading ? (
                    <>
                      <span className="loading loading-spinner loading-sm" />
                      Saving…
                    </>
                  ) : isFavorite ? (
                    <>
                      <AiFillHeart size={18} />
                      Saved
                    </>
                  ) : (
                    <>
                      <AiOutlineHeart size={18} />
                      Save
                    </>
                  )}
                </button>

                {!hasToken && (
                  <div className="text-xs opacity-70">
                    Log in to attend, save favorites and comment.
                  </div>
                )}
              </div>

              {attendError && (
                <div className="alert alert-error">
                  <IconText icon={FiAlertTriangle}>{attendError}</IconText>
                </div>
              )}

              {favError && (
                <div className="alert alert-error">
                  <IconText icon={FiAlertTriangle}>{favError}</IconText>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </PageLayout>
  );
}
