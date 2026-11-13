import "../test.css";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Clock3,
  Construction,
  Lightbulb,
  MapPin,
  Trash2,
  Waves,
  Droplets,
  Trees,
  ShieldCheck,
  Zap
} from "lucide-react";

const categories = [
  {
    name: "Roads",
    icon: Construction,
    description: "Broken roads, potholes and damaged sidewalks"
  },
  {
    name: "Streetlights",
    icon: Lightbulb,
    description: "Broken lights and dark streets"
  },
  {
    name: "Garbage",
    icon: Trash2,
    description: "Overflowing bins and illegal dumping"
  },
  {
    name: "Drainage",
    icon: Waves,
    description: "Open drains, blocked drains and flooding"
  },
  {
    name: "Water",
    icon: Droplets,
    description: "Water leaks and broken pipelines"
  },
  {
    name: "Public Spaces",
    icon: Trees,
    description: "Damaged parks and public areas"
  }
];

function Home() {
  return (
    <main>

      {/* HERO */}

      <section className="home-hero">

        <div className="hero-content">

          <div className="eyebrow">
            <span></span>
            A SMARTER WAY TO IMPROVE YOUR CITY
          </div>

          <h1>
            MAKE YOUR CITY
            <br />
            <em>BETTER,</em>
            <br />
            TOGETHER.
          </h1>

          <p>
            Report local problems, track their progress,
            and help make your community a better place.
          </p>

          <div className="hero-buttons">

            <Link to="/report" className="primary-btn">
              Report a Problem
              <ArrowRight size={17} />
            </Link>

            <Link to="/explore" className="outline-btn">
              Explore Issues
            </Link>

          </div>

          <div className="trust">

            <ShieldCheck size={15} />

            Transparent reporting
            • Real-time updates
            • Community powered

          </div>

        </div>


        {/* MAP */}

        <div className="hero-map">

          <div className="fake-map">

            <div className="map-road road-one"></div>
            <div className="map-road road-two"></div>
            <div className="map-road road-three"></div>

            <div className="map-pin pin-one">
              <MapPin size={22} />
            </div>

            <div className="map-pin pin-two">
              <MapPin size={22} />
            </div>

            <div className="map-pin pin-three">
              <MapPin size={22} />
            </div>

            <div className="map-pin pin-four">
              <MapPin size={22} />
            </div>

            <div className="map-info">

              <Construction size={16} />

              <div>
                <strong>Broken Road</strong>
                <small>Clifton Block 4</small>

                <span>IN PROGRESS</span>
              </div>

            </div>

          </div>

        </div>


        {/* STATS */}

        <div className="home-stats">

          <div>
            <Construction />
            <strong>24,892</strong>
            <span>Issues Reported</span>
          </div>

          <div>
            <Check />
            <strong>18,420</strong>
            <span>Issues Resolved</span>
          </div>

          <div>
            <Zap />
            <strong>73%</strong>
            <span>Resolution Rate</span>
          </div>

          <div>
            <Clock3 />
            <strong>4.2 Days</strong>
            <span>Average Response</span>
          </div>

        </div>

      </section>


      {/* WHAT NEEDS FIXING */}

      <section className="fix-section">

        <div className="section-title">

          <div>
            <span>REPORT IN SECONDS</span>

            <h2>
              WHAT NEEDS
              <br />
              FIXING?
            </h2>
          </div>

          <p>
            Select a category and tell us what's
            happening in your area.
          </p>

        </div>


        <div className="category-grid">

          {categories.map((category) => {

            const Icon = category.icon;

            return (
              <Link
                to="/report"
                className="category-card"
                key={category.name}
              >

                <div className="category-icon">
                  <Icon size={27} />
                </div>

                <h3>{category.name}</h3>

                <p>{category.description}</p>

                <ArrowUpRight className="category-arrow" />

              </Link>
            );

          })}

        </div>

        <Link to="/issues" className="center-button">
          View All Issues
          <ArrowRight size={16} />
        </Link>

      </section>


      {/* HOW IT WORKS */}

      <section className="how-section">

        <div className="center-heading">

          <span>SIMPLE BY DESIGN</span>

          <h2>
            FROM PROBLEM
            <br />
            TO PROGRESS.
          </h2>

        </div>


        <div className="steps">

          <div>
            <small>01</small>
            <div className="step-icon">
              <MapPin />
            </div>

            <h3>SPOT IT</h3>

            <p>
              See something that needs fixing.
            </p>
          </div>


          <div>
            <small>02</small>
            <div className="step-icon">
              <Construction />
            </div>

            <h3>REPORT IT</h3>

            <p>
              Send a photo, location and details.
            </p>
          </div>


          <div>
            <small>03</small>
            <div className="step-icon">
              <Clock3 />
            </div>

            <h3>TRACK IT</h3>

            <p>
              Follow your report through the system.
            </p>
          </div>


          <div>
            <small>04</small>
            <div className="step-icon">
              <Check />
            </div>

            <h3>SEE IT FIXED</h3>

            <p>
              Get notified when the problem is resolved.
            </p>
          </div>

        </div>

      </section>


      {/* CTA */}

      <section className="home-cta">

        <div>

          <span>YOUR CITY. YOUR VOICE.</span>

          <h2>
            SEE A PROBLEM?
            <br />
            <em>REPORT IT.</em>
          </h2>

          <p>
            Every report helps authorities understand
            what your community needs.
          </p>

          <Link to="/report" className="primary-btn">
            Report a Problem
            <ArrowRight size={17} />
          </Link>

        </div>

      </section>

    </main>
  );
}

export default Home;