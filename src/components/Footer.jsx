
import "./footer.css";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Mail,
  MapPin
} from "lucide-react";

function Footer() {
  const scrollToSection = (id) => {
    const section = document.getElementById(id);

    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const backToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

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

          <button
            type="button"
            onClick={() => scrollToSection("how-it-works")}
            className="footer-text-button"
          >
            How It Works
          </button>

          <button
            type="button"
            onClick={() => scrollToSection("about")}
            className="footer-text-button"
          >
            About CivicFix
          </button>

          <button
            type="button"
            onClick={() => scrollToSection("contact")}
            className="footer-text-button"
          >
            Contact Us
          </button>
        </div>

        {/* Contact */}
        <div className="footer-column footer-contact">
          <h4>Stay Connected</h4>

          <a
            href="mailto:hello@civicfix.com"
            className="footer-email"
          >
            <Mail size={16} />
            <span>hello@civicfix.com</span>
          </a>

          <div className="footer-socials">

            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <span className="social-text instagram-text">◎</span>
            </a>

            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <span className="social-text">f</span>
            </a>

            <a
              href="https://x.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X"
            >
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
          <button
            type="button"
            onClick={() => scrollToSection("privacy")}
            className="footer-text-button"
          >
            Privacy
          </button>

          <button
            type="button"
            onClick={() => scrollToSection("terms")}
            className="footer-text-button"
          >
            Terms
          </button>
        </div>

        <button
          type="button"
          onClick={backToTop}
          className="footer-back-top"
        >
          Back to top
          <ArrowUpRight size={15} />
        </button>
      </div>
    </footer>
  );
}

export default Footer;
