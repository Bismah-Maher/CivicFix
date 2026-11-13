import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, LockKeyhole, UserRound, Mail } from "lucide-react";
import { registerUser, setCurrentUser } from "../auth/auth";
import "./Auth.css";

function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please complete all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const result = registerUser({ name, email, password });

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setCurrentUser(result.user);
    navigate("/dashboard", { replace: true });
  };

  return (
    <main className="page auth-page">
      <section className="auth-shell single-auth-shell">
        <div className="auth-card">
          <span className="auth-eyebrow">JOIN CIVICFIX</span>
          <h2>Create your account</h2>
          <p className="auth-card-copy">
            Keep your reports together in one place while public reporting and
            tracking stay open to everyone.
          </p>

          <form onSubmit={handleSubmit}>
            <label>Name</label>
            <div className="auth-input-wrap">
              <UserRound size={16} />
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>

            <label>Email</label>
            <div className="auth-input-wrap">
              <Mail size={16} />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <label>Password</label>
            <div className="auth-input-wrap">
              <LockKeyhole size={16} />
              <input
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            <label>Confirm Password</label>
            <div className="auth-input-wrap">
              <LockKeyhole size={16} />
              <input
                type="password"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button className="auth-submit" type="submit">
              Create Account
              <ArrowRight size={16} />
            </button>
          </form>

          <p className="auth-footer-link">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default Signup;
