import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ArrowRight, LogIn, LayoutDashboard, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { getCurrentUser, logout } from "../auth/auth";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(getCurrentUser);

  useEffect(() => {
    const refreshAuth = () => setUser(getCurrentUser());
    window.addEventListener("civicfix-auth-changed", refreshAuth);
    return () => window.removeEventListener("civicfix-auth-changed", refreshAuth);
  }, []);

  const links = [
    { name: "Home", path: "/" },
    { name: "Report Problem", path: "/report" },
    { name: "Explore Issues", path: "/explore" },
    { name: "What Needs Fixing", path: "/issues" },
    { name: "Track Problem", path: "/track" },
  ];

  const handleLogout = () => {
    logout();
    setUser(null);
    setOpen(false);
    navigate("/");
  };

  const dashboardPath = user?.role === "admin" ? "/admin" : "/dashboard";

  return (
    <nav className="navbar">
      <Link to="/" className="logo" onClick={() => setOpen(false)}>
        CIVIC<span>FIX</span>
      </Link>

      <div className={`nav-links ${open ? "show" : ""}`}>
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            onClick={() => setOpen(false)}
            className={location.pathname === link.path ? "active" : ""}
          >
            {link.name}
          </Link>
        ))}
      </div>

      <div className="nav-right">
        <Link to="/track" className="track-btn">
          Track Report
        </Link>

        {user ? (
          <>
            <Link to={dashboardPath} className="dashboard-nav-btn">
              <LayoutDashboard size={14} />
              {user.role === "admin" ? "Admin" : "Dashboard"}
            </Link>
            <button type="button" className="logout-nav-btn" onClick={handleLogout}>
              <LogOut size={14} />
            </button>
          </>
        ) : (
          <Link to="/login" className="login-nav-btn">
            <LogIn size={14} />
            Login
          </Link>
        )}

        <Link to="/report" className="report-btn">
          Report a Problem
          <ArrowRight size={15} />
        </Link>
      </div>

      <button
        className="mobile-menu"
        onClick={() => setOpen(!open)}
        aria-label="Toggle navigation"
      >
        {open ? <X /> : <Menu />}
      </button>
    </nav>
  );
}

export default Navbar;
