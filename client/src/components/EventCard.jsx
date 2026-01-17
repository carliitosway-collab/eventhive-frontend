import { useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FiMapPin, FiCalendar, FiArrowRight } from "react-icons/fi";
import { LangContext } from "../context/lang.context";

function formatEventDate(dateIso, lang) {
  if (!dateIso) return "";

  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return "";

  const locale = lang === "es" ? "es-ES" : "en-GB";

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export default function EventCard({ event }) {
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
      className="
        card bg-base-100 border border-base-300 rounded-2xl
        shadow-sm hover:shadow-md transition cursor-pointer
        hover:-translate-y-[1px] active:translate-y-0
        h-full
      "
    >
      <div className="card-body gap-3 flex flex-col">
        {/* Top */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="card-title text-base md:text-lg leading-snug line-clamp-2">
            {event?.title || "Untitled"}
          </h3>

          {/* Badge: SOLO si es privado */}
          {isPrivate && (
            <span className="badge badge-neutral shrink-0" title={t?.private || "Private"}>
              {t?.private || "Private"}
            </span>
          )}
        </div>

        {/* Description (min-height para uniformidad) */}
        <p className="opacity-80 line-clamp-3 min-h-[3.75rem]">
          {event?.description || t?.noDesc || "No description"}
        </p>

        {/* Meta */}
        <div className="flex flex-wrap gap-3 text-sm opacity-80">
          <span className="inline-flex items-center gap-2 min-w-0">
            <FiMapPin />
            <span className="line-clamp-1">{event?.location || t?.noLocation || "No location"}</span>
          </span>

          <span className="inline-flex items-center gap-2">
            <FiCalendar />
            <span className="whitespace-nowrap">{dateText}</span>
          </span>
        </div>

        {/* Footer pegado abajo */}
        <div className="mt-auto pt-2 text-xs opacity-70 inline-flex items-center gap-2">
          <span className="font-semibold">{t?.viewDetails || "View details"}</span>
          <FiArrowRight />
        </div>
      </div>
    </article>
  );
}
