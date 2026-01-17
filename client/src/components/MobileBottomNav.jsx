import { NavLink } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/auth.context";

import { FiHome, FiSearch, FiPlusSquare, FiHeart, FiUser } from "react-icons/fi";

export default function MobileBottomNav() {
  const { isLoggedIn } = useContext(AuthContext);

  const linkClass = ({ isActive }) =>
    [
      "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition",
      isActive
        ? "text-primary"
        : "text-base-content/70 hover:text-base-content",
    ].join(" ");

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-base-100/95 backdrop-blur border-t border-base-300">
      <div className="max-w-6xl mx-auto px-2">
        <div className="h-16 flex items-center justify-between">
          {/* Home */}
          <NavLink to="/" className={linkClass} aria-label="Home">
            <FiHome size={20} />
            <span className="text-[11px] font-medium">Home</span>
          </NavLink>

          {/* Explore */}
          <NavLink to="/events" className={linkClass} aria-label="Explore events">
            <FiSearch size={20} />
            <span className="text-[11px] font-medium">Explore</span>
          </NavLink>

          {/* Create / Login (CTA destacado) */}
          <NavLink
            to={isLoggedIn ? "/events/new" : "/login"}
            className={() =>
              [
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition",
                "text-primary",
                "bg-primary/10 hover:bg-primary/20",
              ].join(" ")
            }
            aria-label={isLoggedIn ? "Create event" : "Login"}
          >
            <FiPlusSquare size={22} />
            <span className="text-[11px] font-semibold">
              {isLoggedIn ? "Create" : "Login"}
            </span>
          </NavLink>

          {/* Favorites */}
          <NavLink
            to={isLoggedIn ? "/favorites" : "/login"}
            className={linkClass}
            aria-label="Favorites"
          >
            <FiHeart size={20} />
            <span className="text-[11px] font-medium">Saved</span>
          </NavLink>

          {/* Profile */}
          <NavLink
            to={isLoggedIn ? "/my-events" : "/signup"}
            className={linkClass}
            aria-label="Profile"
          >
            <FiUser size={20} />
            <span className="text-[11px] font-medium">
              {isLoggedIn ? "Me" : "Signup"}
            </span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
