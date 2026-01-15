import { useEffect, useState } from "react";
import api from "../services/api.service";

export default function EventsListPage() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/events") // -> GET /api/events (público)
      .then((res) => setEvents(res.data.data || []))
      .catch(() => setError("No pude cargar eventos (¿backend encendido?)"));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Events</h1>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {events.length === 0 ? (
        <p>No events yet.</p>
      ) : (
        <ul>
          {events.map((ev) => (
            <li key={ev._id}>
              <strong>{ev.title}</strong> — {ev.location}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
