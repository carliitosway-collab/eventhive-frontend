import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiEdit2,
  FiTrash2,
  FiLoader,
  FiAlertTriangle,
  FiPlus,
  FiRefreshCcw,
} from "react-icons/fi";

import eventsService from "../services/events.service";
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

export default function MyEventsPage() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMyEvents = () => {
    setIsLoading(true);
    setError("");

    eventsService
      .getMyEvents()
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setEvents(data);
      })
      .catch((err) => {
        console.log(err);
        setError(getNiceHttpError(err, "Could not load your events."));
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const handleDelete = (eventId) => {
    const ok = window.confirm(
      "Are you sure you want to delete this event? This action cannot be undone."
    );
    if (!ok) return;

    const previous = events;
    setEvents((prev) => prev.filter((ev) => ev._id !== eventId));

    eventsService.deleteEvent(eventId).catch((err) => {
      console.log(err);
      setEvents(previous);
      setError(getNiceHttpError(err, "Could not delete the event."));
    });
  };

  return (
    <PageLayout>
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4">
        <Link to="/events" className="btn btn-ghost btn-sm border border-base-300 gap-2">
          <FiArrowLeft />
          Back
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchMyEvents}
            className="btn btn-ghost btn-sm border border-base-300 gap-2"
            disabled={isLoading}
          >
            <FiRefreshCcw />
            Refresh
          </button>

          <button
            type="button"
            onClick={() => navigate("/events/new")}
            className="btn btn-primary btn-sm gap-2 shadow-md hover:shadow-lg transition active:scale-[0.98]"
          >
            <FiPlus />
            New event
          </button>
        </div>
      </div>

      <header className="mt-4 mb-6">
        <h1 className="text-4xl md:text-5xl font-black">My events</h1>

        {!isLoading && !error && (
          <p className="opacity-70 mt-2">
            {events.length} {events.length === 1 ? "event" : "events"} created
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

          <button type="button" onClick={fetchMyEvents} className="btn btn-outline btn-sm gap-2">
            <FiRefreshCcw />
            Retry
          </button>
        </div>
      ) : events.length === 0 ? (
        <div className="card bg-base-100 border border-base-300 rounded-2xl shadow-sm">
          <div className="card-body">
            <p className="opacity-75">You haven’t created any events yet.</p>

            <div className="card-actions">
              <button
                type="button"
                className="btn btn-primary gap-2 shadow-md hover:shadow-lg transition active:scale-[0.98]"
                onClick={() => navigate("/events/new")}
              >
                <FiPlus />
                Create your first event
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {events.map((ev) => {
            // Since this page uses ?mine=true, the backend should only return your events.
            // Keep a light guard: if createdBy exists, we still allow actions.
            const canManage = true;

            return (
              <div key={ev._id} className="card bg-base-100 border border-base-300 rounded-2xl shadow-sm">
                <div className="card-body">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="min-w-[200px]">
                      <h3 className="text-lg font-bold m-0">{ev?.title || "Untitled"}</h3>
                      <p className="mt-1 opacity-70 text-sm">{ev?.location || "No location"}</p>
                    </div>

                    {canManage && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link to={`/events/${ev._id}`} className="btn btn-ghost btn-sm border border-base-300">
                          View
                        </Link>

                        <Link to={`/events/edit/${ev._id}`} className="btn btn-outline btn-sm gap-2">
                          <FiEdit2 />
                          Edit
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleDelete(ev._id)}
                          className="btn btn-outline btn-sm btn-error gap-2"
                        >
                          <FiTrash2 />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageLayout>
  );
}
