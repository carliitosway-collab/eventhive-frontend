import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiLoader,
  FiAlertTriangle,
  FiRefreshCcw,
} from "react-icons/fi";

import eventsService from "../services/events.service";
import EventCard from "../components/EventCard";
import { getNiceHttpError } from "../utils/httpErrors";
import PageLayout from "../layouts/PageLayout";

function IconText({ icon: Icon, children }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Icon />
      {children}
    </span>
  );
}

export default function AttendingPage() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAttending = () => {
    setIsLoading(true);
    setError("");

    eventsService
      .getAttendingEvents()
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setEvents(data);
      })
      .catch((err) =>
        setError(getNiceHttpError(err, "Could not load attending.")),
      )
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchAttending();
  }, []);

  const PILL_BTN =
    "inline-flex items-center gap-2 rounded-full border border-base-300 px-4 py-1.5 text-sm font-medium shadow-sm hover:bg-base-200 transition active:scale-[0.98]";

  return (
    <PageLayout>
      <div className="flex items-center justify-between gap-4">
        <Link to="/events" className={PILL_BTN}>
          <FiArrowLeft />
          Back
        </Link>
      </div>

      <header className="mt-4 mb-6">
        <h1 className="text-4xl font-black">Attending</h1>

        {!isLoading && !error && (
          <p className="opacity-70 mt-2">
            {events.length} event{events.length !== 1 && "s"}
          </p>
        )}
      </header>

      {isLoading ? (
        <IconText icon={FiLoader}>Loading…</IconText>
      ) : error ? (
        <div className="space-y-3">
          <div className="alert alert-error">
            <IconText icon={FiAlertTriangle}>{error}</IconText>
          </div>

          <button type="button" onClick={fetchAttending} className={PILL_BTN}>
            <FiRefreshCcw />
            Retry
          </button>
        </div>
      ) : events.length === 0 ? (
        <p className="opacity-70">You’re not attending any events yet.</p>
      ) : (
        <div className="grid gap-4">
          {events.map((ev) => (
            <EventCard key={ev._id} event={ev} />
          ))}
        </div>
      )}
    </PageLayout>
  );
}
