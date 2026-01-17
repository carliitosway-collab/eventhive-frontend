import { Routes, Route } from "react-router-dom";
import IsPrivate from "./components/IsPrivate";
import IsAnon from "./components/IsAnon";
import Navbar from "./components/Navbar";
import MobileBottomNav from "./components/MobileBottomNav";
import "./index.css";

// Pages
import HomePage from "./pages/HomePage";
import EventsListPage from "./pages/EventsListPage";
import EventDetailsPage from "./pages/EventDetailsPage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import NewEventPage from "./pages/NewEventPage";
import EditEventPage from "./pages/EditEventPage";
import MyEventsPage from "./pages/MyEventsPage";
import AttendingPage from "./pages/AttendingPage";
import FavoritesPage from "./pages/FavoritesPage";

function App() {
  return (
    <div className="min-h-screen">
      {/* Desktop navbar */}
      <div className="hidden md:block">
        <Navbar />
      </div>

      {/* Main content (extra bottom padding for mobile bottom nav) */}
      <div className="pb-20 md:pb-0">
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/events" element={<EventsListPage />} />
          <Route path="/events/:eventId" element={<EventDetailsPage />} />

          {/* Only anon */}
          <Route
            path="/signup"
            element={
              <IsAnon>
                <SignupPage />
              </IsAnon>
            }
          />
          <Route
            path="/login"
            element={
              <IsAnon>
                <LoginPage />
              </IsAnon>
            }
          />

          {/* Private */}
          <Route
            path="/events/new"
            element={
              <IsPrivate>
                <NewEventPage />
              </IsPrivate>
            }
          />
          <Route
            path="/events/edit/:eventId"
            element={
              <IsPrivate>
                <EditEventPage />
              </IsPrivate>
            }
          />
          <Route
            path="/my-events"
            element={
              <IsPrivate>
                <MyEventsPage />
              </IsPrivate>
            }
          />
          <Route
            path="/attending"
            element={
              <IsPrivate>
                <AttendingPage />
              </IsPrivate>
            }
          />
          <Route
            path="/favorites"
            element={
              <IsPrivate>
                <FavoritesPage />
              </IsPrivate>
            }
          />
        </Routes>
      </div>

      {/* Mobile bottom navigation */}
      <MobileBottomNav />
    </div>
  );
}

export default App;
