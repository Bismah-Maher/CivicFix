import {
    Construction,
    Lightbulb,
    Trash2,
    Waves,
    Droplets,
    MapPin,
    Search,
    Filter
  } from "lucide-react";
  
  const reports = [
    {
      title: "Broken Road",
      location: "Clifton Block 4",
      status: "In Progress",
      icon: Construction
    },
    {
      title: "Garbage Overflow",
      location: "Gulshan-e-Iqbal",
      status: "Under Review",
      icon: Trash2
    },
    {
      title: "Streetlight Broken",
      location: "PECHS Block 2",
      status: "Resolved",
      icon: Lightbulb
    },
    {
      title: "Open Drain",
      location: "North Nazimabad",
      status: "In Progress",
      icon: Waves
    },
    {
      title: "Water Leakage",
      location: "DHA Phase 7",
      status: "Reported",
      icon: Droplets
    }
  ];
  
  function ExploreIssues() {
  
    return (
  
      <main className="page">
  
        <section className="explore-page">
  
          <div className="page-heading">
  
            <span>LIVE CIVIC MAP</span>
  
            <h1>
              EXPLORE
              <br />
              <em>ISSUES.</em>
            </h1>
  
            <p>
              See what problems people are reporting
              across your city.
            </p>
  
          </div>
  
  
          <div className="explore-layout">
  
            {/* LIST */}
  
            <div className="issues-panel">
  
              <div className="explore-search">
  
                <Search size={17} />
  
                <input
                  placeholder="Search location..."
                />
  
                <button>
                  <Filter size={16} />
                </button>
  
              </div>
  
  
              {reports.map((report) => {
  
                const Icon = report.icon;
  
                return (
  
                  <div
                    className="issue-item"
                    key={report.title}
                  >
  
                    <div className="issue-icon">
                      <Icon size={18} />
                    </div>
  
                    <div className="issue-info">
  
                      <strong>
                        {report.title}
                      </strong>
  
                      <span>
                        {report.location}
                      </span>
  
                    </div>
  
                    <span
                      className={`status ${
                        report.status === "Resolved"
                          ? "resolved"
                          : report.status === "In Progress"
                          ? "progress"
                          : "review"
                      }`}
                    >
                      {report.status}
                    </span>
  
                  </div>
  
                );
  
              })}
  
            </div>
  
  
            {/* MAP */}
  
            <div className="explore-map">
  
              <div className="map-background">
  
                <div className="city-road r1"></div>
                <div className="city-road r2"></div>
                <div className="city-road r3"></div>
  
                <MapPin className="city-pin p1" />
                <MapPin className="city-pin p2" />
                <MapPin className="city-pin p3" />
                <MapPin className="city-pin p4" />
  
              </div>
  
              <div className="map-location-card">
  
                <Construction size={18} />
  
                <div>
  
                  <strong>
                    Broken Road
                  </strong>
  
                  <span>
                    Clifton Block 4
                  </span>
  
                  <small>
                    Reported 2 days ago
                  </small>
  
                </div>
  
              </div>
  
            </div>
  
          </div>
  
        </section>
  
      </main>
  
    );
  }
  
  export default ExploreIssues;