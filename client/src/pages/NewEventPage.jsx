import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiAlertTriangle,
  FiPlus,
  FiCalendar,
  FiMapPin,
  FiType,
  FiFileText,
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

function isValidDateTimeLocal(value) {
  if (!value) return false;
  const d = new Date(value);
  return !Number.isNaN(d.getTime());
}

function nowAsMinDateTimeLocal() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

export default function NewEventPage() {
  const navigate = useNavigate();

  // required
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const cleanTitle = title.trim();
    const cleanDesc = description.trim();
    const cleanLoc = location.trim();

    if (!cleanTitle || !cleanDesc || !date || !cleanLoc) {
      setError("Please complete title, description, date and location.");
      return;
    }

    if (!isValidDateTimeLocal(date)) {
      setError("Invalid date. Please use the date and time picker.");
      return;
    }

    const isoDate = new Date(date).toISOString();

    const payload = {
      title: cleanTitle,
      description: cleanDesc,
      date: isoDate,
      location: cleanLoc,
      isPublic,
    };

    setIsLoading(true);

    eventsService
      .createEvent(payload)
      .then((res) => {
        const created = res.data?.data || res.data;
        const createdId = created?._id;

        if (createdId) navigate(`/events/${createdId}`);
        else navigate("/my-events");
      })
      .catch((err) => {
        console.log(err);
        setError(getNiceHttpError(err, "Could not create the event."));
      })
      .finally(() => setIsLoading(false));
  };

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
      </div>

      <header className="mt-4 mb-6">
        <h1 className="text-4xl md:text-5xl font-black">Create event</h1>
        <p className="opacity-70 mt-2">Create a public or private event.</p>
      </header>

      <section className="card bg-base-100 border border-base-300 rounded-2xl shadow-sm">
        <div className="card-body gap-5">
          <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text font-semibold">
                  <IconText icon={FiType}>Title</IconText>
                </span>
              </div>
              <input
                className="input input-bordered w-full"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Ocean Meetup"
                disabled={isLoading}
                autoComplete="off"
              />
            </label>

            <label className="form-control w-full">
              <div className="label">
                <span className="label-text font-semibold">
                  <IconText icon={FiFileText}>Description</IconText>
                </span>
              </div>
              <textarea
                className="textarea textarea-bordered w-full"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell people what the event is about"
                rows={4}
                disabled={isLoading}
              />
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text font-semibold">
                    <IconText icon={FiCalendar}>Date</IconText>
                  </span>
                </div>
                <input
                  type="datetime-local"
                  className="input input-bordered w-full"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  disabled={isLoading}
                  min={nowAsMinDateTimeLocal()}
                />
              </label>

              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text font-semibold">
                    <IconText icon={FiMapPin}>Location</IconText>
                  </span>
                </div>
                <input
                  className="input input-bordered w-full"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Madrid"
                  disabled={isLoading}
                  autoComplete="off"
                />
              </label>
            </div>

            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-3">
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  disabled={isLoading}
                />

                <div className="grid">
                  <span className="font-semibold">
                    {isPublic ? "Public event" : "Private event"}
                  </span>
                  <span className="text-sm opacity-70">
                    {isPublic ? "Visible to everyone." : "Only you can see it."}
                  </span>
                </div>
              </label>
            </div>

            {error && (
              <div className="alert alert-error">
                <IconText icon={FiAlertTriangle}>{error}</IconText>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary btn-wide gap-2 shadow-md hover:shadow-lg transition active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FiPlus />
                    Create event
                  </>
                )}
              </button>

              <Link
                to="/events"
                className="btn btn-ghost border border-base-300"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </section>
    </PageLayout>
  );
}
