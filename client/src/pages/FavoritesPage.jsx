import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiHeart, FiLoader, FiAlertTriangle, FiX } from "react-icons/fi";
import favoritesService from "../services/favorites.service";
import EventCard from "../components/EventCard";

function IconText({ icon: Icon, children, style }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, ...style }}>
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
        setError(err?.response?.data?.message || "No pude cargar favoritos.");
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
      setError("No pude quitar el favorito. Intenta de nuevo.");
    });
  };

  if (isLoading) {
    return (
      <div style={styles.page}>
        <Link to="/events" style={styles.backLink}>
          <IconText icon={FiArrowLeft}>Volver</IconText>
        </Link>

        <h1 style={styles.h1}>
          <IconText icon={FiHeart}>Favorites</IconText>
        </h1>

        <p style={styles.muted}>
          <IconText icon={FiLoader}>Cargando…</IconText>
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <Link to="/events" style={styles.backLink}>
          <IconText icon={FiArrowLeft}>Volver</IconText>
        </Link>

        <h1 style={styles.h1}>
          <IconText icon={FiHeart}>Favorites</IconText>
        </h1>

        <p style={styles.error}>
          <IconText icon={FiAlertTriangle}>{error}</IconText>
        </p>

        <button onClick={fetchFavorites} style={styles.btn} type="button">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <Link to="/events" style={styles.backLink}>
        <IconText icon={FiArrowLeft}>Volver</IconText>
      </Link>

      <header style={{ marginBottom: 14 }}>
        <h1 style={styles.h1}>
          <IconText icon={FiHeart}>Favorites</IconText>
        </h1>
        <p style={styles.subtitle}>{sortedFavorites.length} eventos guardados</p>
      </header>

      {sortedFavorites.length === 0 ? (
        <div style={styles.card}>
          <p style={styles.muted}>Todavía no tienes favoritos.</p>
          <Link to="/events" style={{ ...styles.btn, textDecoration: "none", display: "inline-flex" }}>
            Ver eventos
          </Link>
        </div>
      ) : (
        <div style={styles.grid}>
          {sortedFavorites.map((ev) => (
            <div key={ev._id} style={{ position: "relative" }}>
              <button
                type="button"
                style={styles.removeBtn}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleRemoveFavorite(ev._id);
                }}
                aria-label="Quitar de favoritos"
                title="Quitar de favoritos"
              >
                <IconText icon={FiX} style={{ gap: 6 }}>
                  Quitar
                </IconText>
              </button>

              <EventCard event={ev} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { padding: 20, maxWidth: 900, margin: "0 auto" },
  backLink: { display: "inline-block", marginBottom: 12, textDecoration: "none", opacity: 0.8 },
  h1: { margin: "0 0 6px", fontSize: 42 },
  subtitle: { margin: 0, opacity: 0.7, fontSize: 16 },
  muted: { opacity: 0.75 },
  error: { color: "crimson", marginBottom: 12 },

  grid: { display: "grid", gap: 12 },

  card: {
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 16,
    padding: 16,
    background: "white",
    boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
  },

  btn: {
    marginTop: 10,
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.15)",
    background: "white",
    cursor: "pointer",
    boxShadow: "0 6px 14px rgba(0,0,0,0.06)",
    fontWeight: 600,
  },

  removeBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 2,
    border: "1px solid rgba(0,0,0,0.12)",
    borderRadius: 999,
    padding: "6px 10px",
    background: "white",
    cursor: "pointer",
    fontSize: 12,
    opacity: 0.92,
  },
};
