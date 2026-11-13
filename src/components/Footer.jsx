
import "./footer.css";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Mail,
  MapPin
} from "lucide-react";

function Footer() {
  return (
    <footer className="civic-footer">
      <div className="footer-top">

        {/* Brand */}
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            CIVIC<span>FIX</span>
          </Link>

          <p>
            Report local problems, track progress, and help make
            your city a better place for everyone.
          </p>

          <div className="footer-location">
            <MapPin size={15} />
            <span>Building better communities</span>
          </div>
        </div>

        {/* Explore */}
        <div className="footer-column">
          <h4>Explore</h4>

          <Link to="/">Home</Link>
          <Link to="/explore">Explore Issues</Link>
          <Link to="/issues">What Needs Fixing</Link>
          <Link to="/track">Track a Problem</Link>
        </div>

        {/* Get Involved */}
        <div className="footer-column">
          <h4>Get Involved</h4>

          <Link to="/report">Report a Problem</Link>
          <a href="#how-it-works">How It Works</a>
          <a href="#about">About CivicFix</a>
          <a href="#contact">Contact Us</a>
        </div>

        {/* Contact */}
        <div className="footer-column footer-contact">
          <h4>Stay Connected</h4>

          <a href="mailto:hello@civicfix.com" className="footer-email">
            <Mail size={16} />
            <span>hello@civicfix.com</span>
          </a>

          <div className="footer-socials">

            <a href="#instagram" aria-label="Instagram">
              <span className="social-text instagram-text">◎</span>
            </a>

            <a href="#facebook" aria-label="Facebook">
              <span className="social-text">f</span>
            </a>

            <a href="#twitter" aria-label="Twitter">
              <span className="social-text">𝕏</span>
            </a>

          </div>
        </div>

      </div>

      <div className="footer-divider" />

      {/* Bottom */}
      <div className="footer-bottom">
        <span>© 2026 CivicFix. All rights reserved.</span>

        <div className="footer-bottom-links">
          <a href="#privacy">Privacy</a>
          <a href="#terms">Terms</a>
        </div>

        <a href="#" className="footer-back-top">
          Back to top
          <ArrowUpRight size={15} />
        </a>
      </div>
    </footer>
  );
}

export default Footer;

