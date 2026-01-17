import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiHeart,
  FiLoader,
  FiAlertTriangle,
  FiX,
  FiRefreshCcw,
} from "react-icons/fi";

import favoritesService from "../services/favorites.service";
import EventCard from "../components/EventCard";
import PageLayout from "../layouts/PageLayout";

function IconText({ icon: Icon, children, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Icon />
      {children}
    </span>
  );
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchFavorites = () => {
    setIsLoading(true);
    setError("");

    favoritesService
      .getMyFavorites()
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setFavorites(data);
      })
      .catch((err) => {
        console.log(err);
        setError(err?.response?.data?.message || "Could not load favorites.");
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const sortedFavorites = useMemo(() => {
    return [...favorites].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [favorites]);

  const handleRemoveFavorite = (eventId) => {
    const previous = favorites;
    setFavorites((prev) => prev.filter((ev) => ev._id !== eventId));

    favoritesService.removeFavorite(eventId).catch((err) => {
      console.log(err);
      setFavorites(previous);
      setError("Could not remove favorite. Please try again.");
    });
  };

  return (
    <PageLayout>
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/events"
          className="btn btn-ghost btn-sm border border-base-300 gap-2"
        >
          <FiArrowLeft />
          Back
        </Link>

        <button
          type="button"
          onClick={fetchFavorites}
          className="btn btn-ghost btn-sm border border-base-300 gap-2"
          disabled={isLoading}
        >
          <FiRefreshCcw />
          Refresh
        </button>
      </div>

      <header className="mt-4 mb-6">
        <h1 className="text-4xl md:text-5xl font-black flex items-center gap-3">
          <FiHeart />
          Favorites
        </h1>

        {!isLoading && !error && (
          <p className="opacity-70 mt-2">
            {sortedFavorites.length} saved {sortedFavorites.length === 1 ? "event" : "events"}
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

          <button
            type="button"
            onClick={fetchFavorites}
            className="btn btn-outline btn-sm gap-2"
          >
            <FiRefreshCcw />
            Retry
          </button>
        </div>
      ) : sortedFavorites.length === 0 ? (
        <div className="card bg-base-100 border border-base-300 rounded-2xl shadow-sm">
          <div className="card-body">
            <p className="opacity-75">You don’t have any favorites yet.</p>

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
          {sortedFavorites.map((ev) => (
            <div key={ev._id} className="relative">
              <button
                type="button"
                className="
                  btn btn-xs btn-outline rounded-full
                  absolute top-3 right-3 z-10
                  bg-base-100/90 backdrop-blur
                  shadow-sm
                "
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleRemoveFavorite(ev._id);
                }}
                aria-label="Remove from favorites"
                title="Remove from favorites"
              >
                <span className="inline-flex items-center gap-2">
                  <FiX />
                  Remove
                </span>
              </button>

              <EventCard event={ev} />
            </div>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
