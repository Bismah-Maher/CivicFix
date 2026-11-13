import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, ShieldCheck, UserRound, LockKeyhole } from "lucide-react";
import { loginUser, setCurrentUser } from "../auth/auth";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (location.state?.role === "admin") {
      setRole("admin");
    }
  }, [location.state]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }

    const result = loginUser({ email, password, role });

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setCurrentUser(result.user);
    const destination =
      location.state?.from ||
      (result.user.role === "admin" ? "/admin" : "/dashboard");
    navigate(destination, { replace: true });
  };

  return (
    <main className="page auth-page">
      <section className="auth-shell">
        <div className="auth-copy">
          <span className="auth-eyebrow">CIVICFIX ACCESS</span>
          <h1>
            WELCOME
            <br />
            <em>BACK.</em>
          </h1>
          <p>
            Sign in to manage your CivicFix activity. Reporting and public
            tracking remain available without an account.
          </p>
        </div>

        <div className="auth-card">
          <div className="role-switch">
            <button
              type="button"
              className={role === "user" ? "active" : ""}
              onClick={() => {
                setRole("user");
                setError("");
              }}
            >
              <UserRound size={16} />
              User
            </button>
            <button
              type="button"
              className={role === "admin" ? "active" : ""}
              onClick={() => {
                setRole("admin");
                setError("");
              }}
            >
              <ShieldCheck size={16} />
              Admin
            </button>
          </div>

          <h2>{role === "admin" ? "Admin Login" : "User Login"}</h2>
          <p className="auth-card-copy">
            {role === "admin"
              ? "Authorized CivicFix staff only."
              : "Access your reports and activity."}
          </p>

          <form onSubmit={handleSubmit}>
            <label>Email</label>
            <div className="auth-input-wrap">
              <UserRound size={16} />
              <input
                type="email"
                placeholder={role === "admin" ? "admin@civicfix.com" : "you@example.com"}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <label>Password</label>
            <div className="auth-input-wrap">
              <LockKeyhole size={16} />
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button className="auth-submit" type="submit">
              Login
              <ArrowRight size={16} />
            </button>
          </form>

          {role === "user" ? (
            <p className="auth-footer-link">
              Don't have an account? <Link to="/signup">Create one</Link>
            </p>
          ) : (
            <p className="auth-demo-note">
              Demo admin: <strong>admin@civicfix.com</strong> / <strong>admin123</strong>
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

export default Login;
