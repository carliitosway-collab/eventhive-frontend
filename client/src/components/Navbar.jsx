import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/auth.context";

export default function Navbar() {
  const { isLoggedIn, user, logOutUser } = useContext(AuthContext);

  return (
    <nav style={{ display: "flex", gap: "12px", padding: "12px", borderBottom: "1px solid #ddd" }}>
      <Link to="/">Home</Link>
      <Link to="/events">Events</Link>

      {isLoggedIn ? (
        <>
          <Link to="/my-events">My Events</Link>
          <Link to="/attending">Attending</Link>
          <Link to="/favorites">Favorites</Link>
          <Link to="/events/new">New Event</Link>

          <span style={{ marginLeft: "auto" }}>
            {user?.name ? `👤 ${user.name}` : "👤 Usuario"}

          </span>

          <button onClick={logOutUser}>Logout</button>
        </>
      ) : (
        <span style={{ marginLeft: "auto", display: "flex", gap: "12px" }}>
          <Link to="/signup">Signup</Link>
          <Link to="/login">Login</Link>
        </span>
      )}
    </nav>
  );
}
