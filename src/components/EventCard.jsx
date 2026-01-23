import { useContext, useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiMapPin,
  FiCalendar,
  FiArrowRight,
  FiUpload,
  FiX,
  FiLock,
} from "react-icons/fi";
import { BsBookmark, BsBookmarkFill } from "react-icons/bs";

import { LangContext } from "../context/lang.context";

function extractObjectId(value) {
  const s = String(value || "");
  const match = s.match(/[a-fA-F0-9]{24}/);
  return match ? match[0] : "";
}

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
  return `${get("day")}/${get("month")}/${get("year")} · ${get("hour")}:${get("minute")}`;
}

function formatRelativeDate(dateIso, lang) {
  if (!dateIso) return "";
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return "";

  const now = new Date();
  const startOfDay = (x) =>
    new Date(x.getFullYear(), x.getMonth(), x.getDate());
  const diffDays = Math.round(
    (startOfDay(d).getTime() - startOfDay(now).getTime()) / 86400000,
  );

  const isEs = lang === "es";
  if (diffDays === 0) return isEs ? "hoy" : "today";
  if (diffDays === 1) return isEs ? "mañana" : "tomorrow";
  if (diffDays === -1) return isEs ? "ayer" : "yesterday";
  if (diffDays > 1) return isEs ? `en ${diffDays} días` : `in ${diffDays} days`;
  return isEs
    ? `hace ${Math.abs(diffDays)} días`
    : `${Math.abs(diffDays)} days ago`;
}

function formatPrice(price, lang) {
  if (price === null || price === undefined) return "";
  const n = Number(price);
  if (Number.isNaN(n) || n < 0) return "";
  if (n === 0) return lang === "es" ? "Gratis" : "Free";

  try {
    return new Intl.NumberFormat(lang === "es" ? "es-ES" : "en-GB", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: n % 1 === 0 ? 0 : 2,
    }).format(n);
  } catch {
    return `${n}€`;
  }
}

const CATEGORY_BADGE = {
  Tech: "bg-indigo-100 text-indigo-700 border-indigo-200",
  Music: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200",
  Food: "bg-orange-100 text-orange-700 border-orange-200",
  Networking: "bg-sky-100 text-sky-700 border-sky-200",
  Art: "bg-pink-100 text-pink-700 border-pink-200",
  Gaming: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Education: "bg-violet-100 text-violet-700 border-violet-200",
  Business: "bg-amber-100 text-amber-700 border-amber-200",
  Other: "bg-base-200 text-base-content border-base-300",
};

const CATEGORY_ICON = {
  Tech: "text-indigo-600",
  Music: "text-fuchsia-600",
  Food: "text-orange-600",
  Networking: "text-sky-600",
  Art: "text-pink-600",
  Gaming: "text-emerald-600",
  Education: "text-violet-600",
  Business: "text-amber-600",
  Other: "text-base-content/70",
};

export default function EventCard({
  event,
  isFavorited = false,
  isTogglingFavorite = false,
  onToggleFavorite,
  onShare,
  onRemove,
  showActions = true,
  featured = false,
}) {
  const navigate = useNavigate();
  const { lang, t } = useContext(LangContext);

  const [imgLoaded, setImgLoaded] = useState(false);

  const imgSrc = useMemo(
    () => (event?.imageUrl || "").trim(),
    [event?.imageUrl],
  );
  const hasImage = !!imgSrc;

  useEffect(() => {
    setImgLoaded(false);
  }, [imgSrc]);

  const safeId = useMemo(
    () => extractObjectId(event?._id || event?.id || event?.eventId),
    [event?._id, event?.id, event?.eventId],
  );

  const dateText = useMemo(
    () => formatEventDate(event?.date, lang) || t?.noDate || "No date",
    [event?.date, lang, t],
  );

  const relativeText = useMemo(
    () => formatRelativeDate(event?.date, lang),
    [event?.date, lang],
  );

  const priceText = useMemo(
    () => formatPrice(event?.price, lang),
    [event?.price, lang],
  );

  const goToDetail = () => {
    if (!safeId) return;
    navigate(`/events/${safeId}`);
  };

  const isPrivate = event?.isPublic === false;
  const imageHeight = featured ? "h-56 lg:h-64" : "h-52";

  const ICON_BTN =
    "inline-flex items-center justify-center rounded-full border border-base-300 bg-base-100/90 backdrop-blur h-9 w-9 shadow-sm hover:bg-base-200 transition active:scale-[0.98]";

  const CTA_PILL =
    "inline-flex items-center gap-2 rounded-full border border-base-300 px-4 py-1.5 text-sm font-semibold shadow-sm hover:bg-base-200 transition active:scale-[0.98]";

  return (
    <article
      onClick={goToDetail}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && goToDetail()}
      className={`card bg-base-100 border border-base-300 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden group ${
        featured ? "lg:col-span-3" : ""
      }`}
    >
      <div
        className={`relative w-full overflow-hidden ${imageHeight} bg-base-200`}
      >
        {!imgLoaded && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-base-300 to-base-100" />
        )}

        {hasImage ? (
          <img
            src={imgSrc}
            alt={event?.title || "Event image"}
            onLoad={() => setImgLoaded(true)}
            onError={(e) => {
              console.log("IMG ERROR src:", e.currentTarget.src);
              setImgLoaded(true);
            }}
            referrerPolicy="no-referrer"
            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${
              imgLoaded ? "blur-0" : "blur-md"
            }`}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm opacity-60">
            No image available
          </div>
        )}

        <div
          className={`absolute inset-0 ${
            hasImage
              ? "bg-gradient-to-t from-black/75 via-black/35 to-transparent"
              : "bg-black/45"
          }`}
        />

        {event?.category && (
          <span
            className={`absolute top-3 left-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border shadow-sm backdrop-blur bg-base-100/70 ${
              CATEGORY_BADGE[event.category] || CATEGORY_BADGE.Other
            }`}
          >
            {event.category}
          </span>
        )}

        {isPrivate && (
          <span className="absolute top-3 right-3 badge bg-neutral text-neutral-content gap-1 text-xs">
            <FiLock /> {t?.private || "Private"}
          </span>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="text-lg font-bold line-clamp-2">
            {event?.title || "Untitled"}
          </h3>
          <div className="mt-1 flex items-center gap-2 text-sm opacity-90">
            <FiCalendar
              className={CATEGORY_ICON[event.category] || CATEGORY_ICON.Other}
            />
            <span>{dateText}</span>
          </div>
        </div>
      </div>

      <div className="card-body gap-3">
        <p className="opacity-75 line-clamp-2">
          {event?.description || t?.noDesc || "No description"}
        </p>

        <div className="flex items-center justify-between text-sm">
          <span className="inline-flex items-center gap-2">
            <FiMapPin
              className={CATEGORY_ICON[event.category] || CATEGORY_ICON.Other}
            />
            <span className="font-semibold">
              {event?.location || t?.noLocation || "No location"}
            </span>
          </span>

          {!!relativeText && (
            <span className="badge badge-outline text-xs">{relativeText}</span>
          )}
        </div>

        <div className="text-xs opacity-60">
          <span className="font-medium">{event?.category || "Other"}</span>
          {priceText ? <span> · {priceText}</span> : null}
        </div>

        <div className="mt-2 flex justify-end">
          <button
            type="button"
            className={CTA_PILL}
            onClick={(e) => {
              e.stopPropagation();
              goToDetail();
            }}
            disabled={!safeId}
          >
            <span>{t?.viewDetails || "View details"}</span>
            <FiArrowRight />
          </button>
        </div>
      </div>
    </article>
  );
}
