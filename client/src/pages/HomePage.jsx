import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiCalendar,
  FiHeart,
  FiMessageCircle,
  FiUsers,
  FiArrowRight,
  FiLoader,
  FiAlertTriangle,
  FiPlus,
  FiLogIn,
} from "react-icons/fi";

import { AuthContext } from "../context/auth.context";
import eventsService from "../services/events.service";
import EventCard from "../components/EventCard";

function IconText({ icon: Icon, children, style }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, ...style }}>
      <Icon />
      {children}
    </span>
  );
}

function getNiceError(err) {
  if (!err?.response) return "No hay conexión o el servidor no responde.";
  return err?.response?.data?.message || "Ha ocurrido un error.";
}

export default function HomePage() {
  const { isLoggedIn } = useContext(AuthContext);

  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUpcoming = () => {
    setIsLoading(true);
    setError("");

    eventsService
      .getPublicEvents()
      .then((res) => {
        const payload = res.data?.data ?? res.data;
        const list = Array.isArray(payload) ? payload : payload?.events || [];
        setEvents(list);
      })
      .catch((err) => {
        console.log(err);
        setError(getNiceError(err));
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchUpcoming();
  }, []);

  const upcoming = useMemo(() => {
    const now = new Date();
    return [...events]
      .filter((ev) => (ev?.date ? new Date(ev.date) >= now : true))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 3);
  }, [events]);

  return (
    <div style={styles.page}>
      {/* HERO */}
      <section style={styles.hero}>
        <div style={styles.heroLeft}>
          <p style={styles.kicker}>EventHive</p>
          <h1 style={styles.title}>Descubre eventos y únete en un click</h1>
          <p style={styles.lead}>
            Eventos públicos, favoritos, asistencia y comentarios. Todo en un solo sitio, simple y rápido.
          </p>

          <div style={styles.ctaRow}>
            <Link to="/events" style={styles.primaryBtn}>
              <IconText icon={FiArrowRight}>Ver eventos</IconText>
            </Link>

            {isLoggedIn ? (
              <Link to="/events/new" style={styles.secondaryBtn}>
                <IconText icon={FiPlus}>Crear evento</IconText>
              </Link>
            ) : (
              <Link to="/signup" style={styles.secondaryBtn}>
                <IconText icon={FiLogIn}>Crear cuenta</IconText>
              </Link>
            )}
          </div>

          <div style={styles.badgesRow}>
            <span style={styles.badge}>
              <IconText icon={FiUsers}>Attend</IconText>
            </span>
            <span style={styles.badge}>
              <IconText icon={FiHeart}>Favorites</IconText>
            </span>
            <span style={styles.badge}>
              <IconText icon={FiMessageCircle}>Comments</IconText>
            </span>
            <span style={styles.badge}>
              <IconText icon={FiCalendar}>Upcoming</IconText>
            </span>
          </div>
        </div>

        <div style={styles.heroRight}>
          <div style={styles.heroCard}>
            <p style={styles.heroCardTitle}>Tip rápido</p>
            <p style={styles.heroCardText}>
              Guarda tus eventos favoritos para tenerlos a mano y vuelve cuando quieras.
            </p>

            <div style={styles.heroCardFooter}>
              <Link to="/favorites" style={styles.link}>
                <IconText icon={FiHeart}>Ir a favoritos</IconText>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={styles.howItWorks}>
        <h2 style={styles.h2}>Cómo funciona</h2>

        <div style={styles.stepsGrid}>
          <div style={styles.stepCard}>
            <h3 style={styles.stepTitle}>1. Explora eventos</h3>
            <p style={styles.stepText}>
              Descubre eventos públicos y entra al detalle para ver fecha, ubicación y asistentes.
            </p>
          </div>

          <div style={styles.stepCard}>
            <h3 style={styles.stepTitle}>2. Interactúa</h3>
            <p style={styles.stepText}>
              Inscríbete, guarda eventos en favoritos y participa en los comentarios.
            </p>
          </div>

          <div style={styles.stepCard}>
            <h3 style={styles.stepTitle}>3. Organízate</h3>
            <p style={styles.stepText}>
              Accede a tus favoritos cuando quieras o crea tus propios eventos.
            </p>
          </div>
        </div>
      </section>

      {/* UPCOMING PREVIEW */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.h2}>Próximos eventos</h2>
          <Link to="/events" style={styles.link}>
            <IconText icon={FiArrowRight}>Ver todos</IconText>
          </Link>
        </div>

        {isLoading ? (
          <p style={styles.muted}>
            <IconText icon={FiLoader}>Cargando eventos…</IconText>
          </p>
        ) : error ? (
          <div style={styles.errorBox}>
            <p style={styles.errorText}>
              <IconText icon={FiAlertTriangle}>{error}</IconText>
            </p>
            <button type="button" onClick={fetchUpcoming} style={styles.retryBtn}>
              Reintentar
            </button>
          </div>
        ) : upcoming.length === 0 ? (
          <div style={styles.emptyCard}>
            <p style={styles.muted}>No hay eventos próximos todavía.</p>
            <Link to="/events" style={{ ...styles.primaryBtn, textDecoration: "none", width: "fit-content" }}>
              <IconText icon={FiArrowRight}>Explorar eventos</IconText>
            </Link>
          </div>
        ) : (
          <div style={styles.grid}>
            {upcoming.map((ev) => (
              <EventCard key={ev._id} event={ev} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

const styles = {
  page: { padding: 20, maxWidth: 1100, margin: "0 auto" },

  hero: {
    display: "grid",
    gridTemplateColumns: "1.4fr 0.9fr",
    gap: 16,
    alignItems: "stretch",
    padding: 18,
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 18,
    background: "white",
    boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
  },
  heroLeft: { padding: 10 },
  heroRight: { display: "flex", alignItems: "stretch" },

  kicker: { margin: 0, opacity: 0.75, fontWeight: 700, letterSpacing: 0.4 },
  title: { margin: "6px 0 8px", fontSize: 44, lineHeight: 1.05 },
  lead: { margin: 0, opacity: 0.82, lineHeight: 1.5, maxWidth: 560 },

  ctaRow: { display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" },
  primaryBtn: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.15)",
    background: "white",
    cursor: "pointer",
    boxShadow: "0 6px 14px rgba(0,0,0,0.06)",
    fontWeight: 700,
    textDecoration: "none",
    color: "inherit",
    display: "inline-flex",
    alignItems: "center",
  },
  secondaryBtn: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "white",
    cursor: "pointer",
    fontWeight: 700,
    textDecoration: "none",
    color: "inherit",
    display: "inline-flex",
    alignItems: "center",
  },

  badgesRow: { display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" },
  badge: {
    border: "1px solid rgba(0,0,0,0.10)",
    borderRadius: 999,
    padding: "6px 10px",
    background: "white",
    opacity: 0.92,
    fontSize: 13,
    fontWeight: 700,
  },

  heroCard: {
    width: "100%",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 16,
    padding: 16,
    background: "white",
    boxShadow: "0 10px 24px rgba(0,0,0,0.04)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  heroCardTitle: { margin: 0, fontWeight: 800, opacity: 0.85 },
  heroCardText: { margin: "10px 0 0", opacity: 0.8, lineHeight: 1.45 },
  heroCardFooter: { marginTop: 14 },

  howItWorks: {
    marginTop: 20,
    padding: 18,
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 18,
    background: "white",
    boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
  },

  stepsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 14,
    marginTop: 12,
  },

  stepCard: {
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 14,
    padding: 14,
    background: "white",
    boxShadow: "0 6px 14px rgba(0,0,0,0.04)",
  },

  stepTitle: {
    margin: "0 0 6px",
    fontSize: 18,
    fontWeight: 800,
  },

  stepText: {
    margin: 0,
    opacity: 0.8,
    lineHeight: 1.45,
  },

  section: { marginTop: 18 },
  sectionHeader: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 10,
  },
  h2: { margin: 0, fontSize: 26 },
  link: { textDecoration: "none", color: "inherit", opacity: 0.85, fontWeight: 700 },

  grid: { display: "grid", gap: 12 },

  muted: { opacity: 0.75 },
  emptyCard: {
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 16,
    padding: 16,
    background: "white",
    boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
    display: "grid",
    gap: 10,
  },

  errorBox: {
    border: "1px solid rgba(220, 0, 0, 0.18)",
    borderRadius: 16,
    padding: 16,
    background: "white",
    boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
    display: "grid",
    gap: 10,
  },
  errorText: { margin: 0, color: "crimson" },
  retryBtn: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.15)",
    background: "white",
    cursor: "pointer",
    fontWeight: 700,
    width: "fit-content",
  },
};
