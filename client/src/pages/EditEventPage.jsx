import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiEdit2,
  FiLoader,
  FiAlertTriangle,
  FiSave,
  FiCalendar,
  FiMapPin,
  FiType,
  FiFileText,
  FiLock,
  FiRefreshCcw,
} from "react-icons/fi";

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
  if (status === 403) return "You don’t have permission to edit this event.";
  if (status === 404) return "Event not found.";
  if (!err?.response) return "No connection or the server is not responding.";

  return err?.response?.data?.message || "Something went wrong.";
}

// ISO -> "YYYY-MM-DDTHH:MM" (local) for <input type="datetime-local" />
function toDateTimeLocalValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";

  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const min = pad(d.getMinutes());

  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

export default function EditEventPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("authToken");
  const hasToken = !!token;

  const [event, setEvent] = useState(null);

  // form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateLocal, setDateLocal] = useState("");
  const [location, setLocation] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  // ui
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

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

  // guard rail visual: event owner
  const isOwner = useMemo(() => {
    if (!userIdFromToken || !event?.createdBy) return false;
    const ownerId = typeof event.createdBy === "string" ? event.createdBy : event.createdBy?._id;
    return String(ownerId) === String(userIdFromToken);
  }, [event, userIdFromToken]);

  const prefillForm = (eventData) => {
    setTitle(eventData?.title || "");
    setDescription(eventData?.description || "");
    setLocation(eventData?.location || "");
    setIsPublic(eventData?.isPublic ?? true);
    setDateLocal(toDateTimeLocalValue(eventData?.date));
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
        prefillForm(eventData);
      })
      .catch((err) => {
        console.log(err);
        setError(getNiceError(err));
        setEvent(null);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    // If you land here without a token, go to login
    if (!hasToken) {
      navigate("/login");
      return;
    }

    fetchEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!hasToken) {
      setError("You must be logged in to edit events.");
      return;
    }

    if (!isOwner) {
      setError("You don’t have permission to edit this event.");
      return;
    }

    const cleanTitle = title.trim();
    const cleanDesc = description.trim();
    const cleanLoc = location.trim();

    if (!cleanTitle || !cleanDesc || !cleanLoc || !dateLocal) {
      setError("Please fill in title, description, date and location.");
      return;
    }

    const isoDate = new Date(dateLocal).toISOString();

    setIsSaving(true);

    eventsService
      .updateEvent(eventId, {
        title: cleanTitle,
        description: cleanDesc,
        location: cleanLoc,
        date: isoDate,
        isPublic,
      })
      .then(() => navigate(`/events/${eventId}`))
      .catch((err) => {
        console.log(err);
        setError(getNiceError(err));
      })
      .finally(() => setIsSaving(false));
  };

  // LOADING
  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-between gap-4">
          <Link to="/my-events" className="btn btn-ghost btn-sm border border-base-300 gap-2">
            <FiArrowLeft />
            Back
          </Link>

          <button
            type="button"
            onClick={fetchEvent}
            className="btn btn-ghost btn-sm border border-base-300 gap-2"
            disabled
          >
            <FiRefreshCcw />
            Refresh
          </button>
        </div>

        <header className="mt-4 mb-6">
          <h1 className="text-4xl font-black">
            <IconText icon={FiEdit2}>Edit Event</IconText>
          </h1>
          <p className="opacity-70 mt-2">Loading event details…</p>
        </header>

        <p className="opacity-75">
          <IconText icon={FiLoader}>Loading…</IconText>
        </p>
      </PageLayout>
    );
  }

  // ERROR + no event
  if (!event) {
    return (
      <PageLayout>
        <div className="flex items-center justify-between gap-4">
          <Link to="/my-events" className="btn btn-ghost btn-sm border border-base-300 gap-2">
            <FiArrowLeft />
            Back
          </Link>

          <button
            type="button"
            onClick={fetchEvent}
            className="btn btn-ghost btn-sm border border-base-300 gap-2"
          >
            <FiRefreshCcw />
            Refresh
          </button>
        </div>

        <div className="card bg-base-100 border border-base-300 rounded-2xl shadow-sm mt-6">
          <div className="card-body">
            <h1 className="text-3xl font-black mb-2">
              <IconText icon={FiAlertTriangle}>Could not load</IconText>
            </h1>

            <p className="text-error">{error || "Event not found."}</p>

            <div className="card-actions mt-2">
              <button type="button" onClick={fetchEvent} className="btn btn-outline gap-2">
                <FiRefreshCcw />
                Retry
              </button>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  // NOT OWNER (guard rail visual)
  if (hasToken && !isOwner) {
    return (
      <PageLayout>
        <div className="flex items-center justify-between gap-4">
          <Link to={`/events/${eventId}`} className="btn btn-ghost btn-sm border border-base-300 gap-2">
            <FiArrowLeft />
            Back
          </Link>

          <button
            type="button"
            onClick={fetchEvent}
            className="btn btn-ghost btn-sm border border-base-300 gap-2"
          >
            <FiRefreshCcw />
            Refresh
          </button>
        </div>

        <div className="card bg-base-100 border border-base-300 rounded-2xl shadow-sm mt-6">
          <div className="card-body">
            <h1 className="text-3xl font-black mb-2">
              <IconText icon={FiLock}>No permission</IconText>
            </h1>

            <p className="opacity-80">This event isn’t yours, so you can’t edit it.</p>

            <div className="card-actions mt-2">
              <Link
                to={`/events/${eventId}`}
                className="btn btn-outline gap-2"
              >
                <FiArrowLeft />
                Back to details
              </Link>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  // FORM
  return (
    <PageLayout>
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4">
        <Link to={`/events/${eventId}`} className="btn btn-ghost btn-sm border border-base-300 gap-2">
          <FiArrowLeft />
          Back
        </Link>

        <button
          type="button"
          onClick={fetchEvent}
          className="btn btn-ghost btn-sm border border-base-300 gap-2"
          disabled={isSaving}
        >
          <FiRefreshCcw />
          Refresh
        </button>
      </div>

      <header className="mt-4 mb-6">
        <h1 className="text-4xl font-black">
          <IconText icon={FiEdit2}>Edit Event</IconText>
        </h1>
        <p className="opacity-70 mt-2">Update your event and save changes.</p>
      </header>

      <section className="card bg-base-100 border border-base-300 rounded-2xl shadow-sm">
        <div className="card-body gap-5">
          <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
            <label className="form-control">
              <div className="label">
                <span className="label-text font-bold">
                  <IconText icon={FiType}>Title</IconText>
                </span>
              </div>
              <input
                className="input input-bordered w-full"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Ocean Meetup"
                disabled={isSaving}
                autoComplete="off"
              />
            </label>

            <label className="form-control">
              <div className="label">
                <span className="label-text font-bold">
                  <IconText icon={FiFileText}>Description</IconText>
                </span>
              </div>
              <textarea
                className="textarea textarea-bordered w-full"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell people what this event is about"
                rows={4}
                disabled={isSaving}
              />
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="form-control">
                <div className="label">
                  <span className="label-text font-bold">
                    <IconText icon={FiCalendar}>Date</IconText>
                  </span>
                </div>
                <input
                  type="datetime-local"
                  className="input input-bordered w-full"
                  value={dateLocal}
                  onChange={(e) => setDateLocal(e.target.value)}
                  disabled={isSaving}
                />
              </label>

              <label className="form-control">
                <div className="label">
                  <span className="label-text font-bold">
                    <IconText icon={FiMapPin}>Location</IconText>
                  </span>
                </div>
                <input
                  className="input input-bordered w-full"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Madrid"
                  disabled={isSaving}
                  autoComplete="off"
                />
              </label>
            </div>

            <label className="p-4 border border-base-300 rounded-xl bg-base-200/40">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-bold">Public event</div>
                  <div className="opacity-75 text-sm">
                    {isPublic ? "Visible to everyone" : "Only you can see it"}
                  </div>
                </div>

                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  disabled={isSaving}
                />
              </div>
            </label>

            {error && (
              <div className="alert alert-error">
                <IconText icon={FiAlertTriangle}>{error}</IconText>
              </div>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="btn btn-primary w-fit gap-2 shadow-md hover:shadow-lg transition active:scale-[0.98]"
            >
              {isSaving ? (
                <>
                  <span className="loading loading-spinner loading-sm" />
                  Saving…
                </>
              ) : (
                <IconText icon={FiSave}>Save changes</IconText>
              )}
            </button>
          </form>
        </div>
      </section>
    </PageLayout>
  );
}
