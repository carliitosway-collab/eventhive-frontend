import { useEffect, useMemo, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  FiArrowLeft,
  FiLoader,
  FiAlertTriangle,
  FiMessageCircle,
  FiCalendar,
} from "react-icons/fi";

import commentsService from "../services/comments.service";
import PageLayout from "../layouts/PageLayout";

function IconText({ icon: Icon, children, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Icon />
      {children}
    </span>
  );
}

function extractObjectId(value) {
  const s = String(value || "");
  const match = s.match(/[a-fA-F0-9]{24}/);
  return match ? match[0] : "";
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

export default function CommentDetailsPage() {
  const { commentId: rawCommentId } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const cleanCommentId = useMemo(
    () => extractObjectId(rawCommentId),
    [rawCommentId],
  );
  const cleanEventId = useMemo(
    () => extractObjectId(searchParams.get("eventId")),
    [searchParams],
  );

  const stateComment = location.state?.comment || null;

  const [comment, setComment] = useState(stateComment);
  const [isLoading, setIsLoading] = useState(!stateComment);
  const [error, setError] = useState("");

  const PILL_BTN =
    "inline-flex items-center gap-2 rounded-full border border-base-300 bg-base-100 px-4 py-1.5 text-sm font-medium shadow-sm hover:bg-base-200 transition active:scale-[0.98]";

  useEffect(() => {
    // si URL sucia -> la limpiamos
    if (rawCommentId && cleanCommentId && rawCommentId !== cleanCommentId) {
      const next = `/comments/${cleanCommentId}${cleanEventId ? `?eventId=${cleanEventId}` : ""}`;
      navigate(next, { replace: true, state: location.state });
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawCommentId, cleanCommentId]);

  useEffect(() => {
    if (comment) return;

    if (!cleanCommentId) {
      setIsLoading(false);
      setError("Invalid commentId");
      return;
    }

    if (!cleanEventId) {
      setIsLoading(false);
      setError("Missing eventId (open the comment from an event).");
      return;
    }

    setIsLoading(true);
    setError("");

    commentsService
      .getCommentFromEvent({ eventId: cleanEventId, commentId: cleanCommentId })
      .then((c) => setComment(c))
      .catch((err) => {
        console.log(err);
        setError("Comment not found.");
      })
      .finally(() => setIsLoading(false));
  }, [comment, cleanCommentId, cleanEventId]);

  return (
    <PageLayout>
      <div className="flex items-center justify-between gap-4">
        <Link to="/events" className={PILL_BTN}>
          <FiArrowLeft />
          Back
        </Link>
      </div>

      <header className="mt-4 mb-6">
        <h1 className="text-4xl font-black">Comment Details</h1>
        <p className="opacity-70 mt-2">Single comment view</p>
      </header>

      {isLoading ? (
        <p className="opacity-75">
          <IconText icon={FiLoader}>Loading…</IconText>
        </p>
      ) : error ? (
        <div className="alert alert-error">
          <IconText icon={FiAlertTriangle}>{error}</IconText>
        </div>
      ) : !comment ? (
        <p className="opacity-70">Comment not found.</p>
      ) : (
        <div className="card bg-base-100 border border-base-300 rounded-2xl shadow-sm">
          <div className="card-body gap-4">
            <h2 className="text-lg font-extrabold inline-flex items-center gap-2">
              <FiMessageCircle />
              Comment
            </h2>

            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <div className="min-w-0">
                <div className="font-semibold truncate">
                  {comment?.author?.name || comment?.author?.email || "User"}
                </div>
                {comment?.createdAt && (
                  <div className="opacity-60 inline-flex items-center gap-2 mt-1">
                    <FiCalendar />
                    {timeAgo(comment.createdAt)}
                  </div>
                )}
              </div>

              {cleanEventId && (
                <Link
                  to={`/events/${cleanEventId}`}
                  className="inline-flex items-center gap-2 rounded-full border border-base-300 px-4 py-1.5 text-sm font-medium shadow-sm hover:bg-base-200 transition active:scale-[0.98]"
                >
                  View event
                </Link>
              )}
            </div>

            <p className="text-sm leading-relaxed opacity-85 whitespace-pre-wrap">
              {comment?.text || ""}
            </p>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
