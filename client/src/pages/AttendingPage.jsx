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

function IconText({ icon: Icon, children, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
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
      .catch((err) => {
        console.log(err);
        setError(getNiceHttpError(err, "Could not load your attending events."));
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchAttending();
  }, []);

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
          onClick={fetchAttending}
          className="btn btn-ghost btn-sm border border-base-300 gap-2"
          disabled={isLoading}
        >
          <FiRefreshCcw />
          Refresh
        </button>
      </div>

      <header className="mt-4 mb-6">
        <h1 className="text-4xl md:text-5xl font-black">Attending</h1>

        {!isLoading && !error && (
          <p className="opacity-70 mt-2">
            {events.length} {events.length === 1 ? "event" : "events"}
          </p>
        )}
      </header>

      {isLoading ? (
        <p className="opacity-75">
          <IconText icon={FiLoader}>Loading…</IconText>
        </p>
      ) : error ? (
        <div className="space-y-3">
          <div className="alert alert-error">
            <IconText icon={FiAlertTriangle}>{error}</IconText>
          </div>

          <button type="button" onClick={fetchAttending} className="btn btn-outline btn-sm gap-2">
            <FiRefreshCcw />
            Retry
          </button>
        </div>
      ) : events.length === 0 ? (
        <div className="card bg-base-100 border border-base-300 rounded-2xl shadow-sm">
          <div className="card-body">
            <p className="opacity-75">You’re not attending any events yet.</p>

            <div className="card-actions">
              <Link
                to="/events"
                className="btn btn-primary gap-2 shadow-md hover:shadow-lg transition active:scale-[0.98]"
              >
                Browse events
              </Link>
            </div>
          </div>
        </div>
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
