import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-bold text-brand-600">
          PeerConnect
        </Link>

        {user ? (
          <div className="flex items-center gap-5 text-sm">
            <Link to="/" className="text-gray-600 hover:text-brand-600">
              Feed
            </Link>
            <Link to="/people" className="text-gray-600 hover:text-brand-600">
              Find Peers
            </Link>
            <Link to="/messages" className="text-gray-600 hover:text-brand-600">
              Messages
            </Link>
            <Link to="/profile" className="text-gray-600 hover:text-brand-600">
              {user.name}
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-md bg-gray-100 px-3 py-1.5 text-gray-700 hover:bg-gray-200"
            >
              Log out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-sm">
            <Link to="/login" className="text-gray-600 hover:text-brand-600">
              Log in
            </Link>
            <Link
              to="/signup"
              className="rounded-md bg-brand-600 px-3 py-1.5 text-white hover:bg-brand-700"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
