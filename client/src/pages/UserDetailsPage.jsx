import { Link, useLocation, useParams } from "react-router-dom";
import { FiArrowLeft, FiAlertTriangle, FiUser } from "react-icons/fi";
import PageLayout from "../layouts/PageLayout";

function IconText({ icon: Icon, children, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Icon />
      {children}
    </span>
  );
}

function extractObjectId(value) {
  const s = String(value || "");
  const match = s.match(/[a-fA-F0-9]{24}/);
  return match ? match[0] : "";
}

export default function UserDetailsPage() {
  const { userId } = useParams();
  const location = useLocation();

  const cleanUserId = extractObjectId(userId);
  const user = location.state?.user || null;

  const PILL_BTN =
    "inline-flex items-center gap-2 rounded-full border border-base-300 bg-base-100 px-4 py-1.5 text-sm font-medium shadow-sm hover:bg-base-200 transition active:scale-[0.98]";

  return (
    <PageLayout>
      <div className="flex items-center justify-between gap-4">
        <Link to="/events" className={PILL_BTN}>
          <FiArrowLeft />
          Back
        </Link>
      </div>

      <header className="mt-4 mb-6">
        <h1 className="text-4xl font-black">User Details</h1>
        <p className="opacity-70 mt-2">Profile preview</p>
      </header>

      {!cleanUserId ? (
        <div className="alert alert-error">
          <IconText icon={FiAlertTriangle}>Invalid userId</IconText>
        </div>
      ) : !user ? (
        <div className="alert alert-warning">
          <IconText icon={FiAlertTriangle}>
            This backend doesn’t provide GET /users/:userId yet. Open a user
            from a comment/event to view details.
          </IconText>
        </div>
      ) : (
        <div className="card bg-base-100 border border-base-300 rounded-2xl shadow-sm">
          <div className="card-body gap-4">
            <h2 className="text-lg font-extrabold inline-flex items-center gap-2">
              <FiUser />
              User
            </h2>

            <div className="grid gap-2 text-sm">
              <div>
                <span className="font-semibold">Name:</span>{" "}
                <span className="opacity-80">{user?.name || "—"}</span>
              </div>
              <div>
                <span className="font-semibold">Email:</span>{" "}
                <span className="opacity-80">{user?.email || "—"}</span>
              </div>
              <div className="opacity-60">
                <span className="font-semibold">Id:</span> {cleanUserId}
              </div>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
