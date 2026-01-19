import { useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FiMapPin, FiCalendar, FiArrowRight, FiUpload } from "react-icons/fi";
import { BsBookmark, BsBookmarkFill } from "react-icons/bs";

import { LangContext } from "../context/lang.context";

function formatEventDate(dateIso, lang) {
  if (!dateIso) return "";

  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return "";

  const locale = lang === "es" ? "es-ES" : "en-GB";

  const parts = new Intl.DateTimeFormat(locale, {
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
}

export default function EventCard({
  event,
  isFavorited = false,
  isTogglingFavorite = false,
  onToggleFavorite,
  onShare,
}) {
  const navigate = useNavigate();
  const { lang, t } = useContext(LangContext);

  const dateText = useMemo(() => {
    const formatted = formatEventDate(event?.date, lang);
    return formatted || t?.noDate || "No date";
  }, [event?.date, lang, t]);

  const goToDetail = () => {
    if (!event?._id) return;
    navigate(`/events/${event._id}`);
  };

  const isPrivate = event?.isPublic === false;

  return (
    <article
      onClick={goToDetail}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") goToDetail();
      }}
      className={`
      card bg-base-100 border border-base-300 rounded-2xl
      border-t-4 ${isPrivate ? "border-t-neutral" : "border-t-transparent"}
      shadow-sm hover:shadow-md
      transition-all duration-200 ease-out
      cursor-pointer
      hover:-translate-y-[1px] active:translate-y-0
      focus:outline-none focus-visible:ring focus-visible:ring-primary/30
      focus-visible:ring-offset-2 focus-visible:ring-offset-base-100
      h-full
      `}
    >
      <div className="card-body gap-3 flex flex-col">
        {/* Top */}
        {/* Top */}
        <div className="flex items-start justify-between gap-3">
          <h3
            className={`card-title text-base md:text-lg font-semibold leading-snug line-clamp-2 min-h-[3.25rem] ${
              isPrivate ? "opacity-90" : "opacity-100"
            }`}
          >
            {event?.title || "Untitled"}
          </h3>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite?.(event?._id);
              }}
              className="btn btn-sm btn-circle bg-base-200/70 hover:bg-base-300/80 border border-base-300 backdrop-blur shadow-sm hover:shadow-md text-base-content/80 hover:text-base-content active:scale-95 transition focus-visible:ring focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-base-100"
              aria-label={
                isFavorited ? t?.saved || "Saved" : t?.save || "Save event"
              }
              title={isFavorited ? t?.saved || "Saved" : t?.save || "Save"}
              disabled={isTogglingFavorite}
            >
              {isTogglingFavorite ? (
                <span className="loading loading-spinner loading-sm" />
              ) : isFavorited ? (
                <BsBookmarkFill className="text-amber-500 scale-110 transition-transform" />
              ) : (
                <BsBookmark className="opacity-70 hover:opacity-100" />
              )}
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onShare?.(event);
              }}
              className="btn btn-sm btn-circle bg-base-200/70 hover:bg-base-300/80 border border-base-300 backdrop-blur shadow-sm hover:shadow-md text-base-content/80 hover:text-base-content active:scale-95 transition focus-visible:ring focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-base-100"
              aria-label={t?.share || "Share event"}
              title={t?.share || "Share"}
            >
              <FiUpload />
            </button>

            {/* Badge: SOLO si es privado */}
            {isPrivate && (
              <span
                className="badge badge-neutral badge-outline"
                title={t?.private || "Private"}
              >
                {t?.private || "Private"}
              </span>
            )}
          </div>
        </div>

        {/* Description (min-height para uniformidad) */}
        <p className="opacity-80 line-clamp-2 min-h-[3rem]">
          {event?.description || t?.noDesc || "No description"}
        </p>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 text-sm opacity-90">
          <span className="inline-flex items-center gap-2 min-w-0">
            <span className="shrink-0">
              <FiMapPin />
            </span>

            <span className="line-clamp-1">
              {event?.location || t?.noLocation || "No location"}
            </span>
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="shrink-0">
              <FiCalendar />
            </span>

            <span className="whitespace-nowrap">{dateText}</span>
          </span>
        </div>

        {/* Footer pegado abajo */}
        <div className="group mt-auto pt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary opacity-95 hover:opacity-100 hover:underline underline-offset-4">
          <span>{t?.viewDetails || "View details"}</span>
          <FiArrowRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
        </div>
      </div>
    </article>
  );
}
