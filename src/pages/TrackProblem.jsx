import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Check,
  Clock3,
  MapPin,
  Search,
  AlertCircle,
  Circle,
} from "lucide-react";

const REPORTS_STORAGE_KEY = "civicfix_reports";

const getSavedReports = () => {
  try {
    const saved = localStorage.getItem(REPORTS_STORAGE_KEY);
    const reports = saved ? JSON.parse(saved) : [];
    return Array.isArray(reports) ? reports : [];
  } catch (error) {
    console.error("Could not read CivicFix reports:", error);
    return [];
  }
};

const formatDateTime = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatStatusLabel = (status) => {
  switch (status) {
    case "submitted":
      return "SUBMITTED";
    case "verified":
      return "VERIFIED";
    case "assigned":
      return "ASSIGNED";
    case "in_progress":
      return "IN PROGRESS";
    case "resolved":
      return "RESOLVED";
    case "rejected":
      return "REJECTED";
    default:
      return "PENDING VERIFICATION";
  }
};

const getTimelineEvent = (report, status) => {
  return Array.isArray(report?.timeline)
    ? report.timeline.find((event) => event?.status === status)
    : null;
};

function TrackProblem() {
  const [reportId, setReportId] = useState("");
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const queryId = searchParams.get("report");
    if (queryId) {
      setReportId(queryId);
    }
  }, [searchParams]);

  useEffect(() => {
    const refreshReport = () => {
      if (!report?.id) return;
      const latest = getSavedReports().find(
        (savedReport) =>
          String(savedReport?.id || "").toUpperCase() ===
          String(report.id || "").toUpperCase()
      );
      if (latest) setReport(latest);
    };

    window.addEventListener("civicfix-reports-changed", refreshReport);
    window.addEventListener("storage", refreshReport);
    return () => {
      window.removeEventListener("civicfix-reports-changed", refreshReport);
      window.removeEventListener("storage", refreshReport);
    };
  }, [report?.id]);

  useEffect(() => {
    if (searchParams.get("report")) {
      const queryId = searchParams.get("report");
      const savedReport = getSavedReports().find(
        (savedReport) =>
          String(savedReport?.id || "").toUpperCase() ===
          String(queryId || "").trim().toUpperCase()
      );

      if (savedReport) {
        setReport(savedReport);
        setError("");
      }
    }
  }, [searchParams]);

  const trackReport = () => {
    const enteredId = reportId.trim().toUpperCase();

    setError("");
    setReport(null);

    if (!enteredId) {
      setError("Please enter your report ID.");
      return;
    }

    const reports = getSavedReports();

    const foundReport = reports.find(
      (savedReport) =>
        String(savedReport?.id || "").toUpperCase() === enteredId
    );

    if (!foundReport) {
      setError(
        "Report not found. Please check your CivicFix report ID and try again."
      );
      return;
    }

    setReport(foundReport);
  };

  const submittedEvent = getTimelineEvent(report, "submitted");
  const verifiedEvent = getTimelineEvent(report, "verified");
  const assignedEvent = getTimelineEvent(report, "assigned");
  const inProgressEvent = getTimelineEvent(report, "in_progress");
  const resolvedEvent = getTimelineEvent(report, "resolved");
  const rejectedEvent = getTimelineEvent(report, "rejected");

  const currentStatus = report?.status || "submitted";

  const renderPendingStep = (title, description = "Pending") => (
    <div className="timeline-step">
      <div className="timeline-dot">
        <Circle size={10} />
      </div>
      <div>
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
    </div>
  );

  return (
    <main className="page">
      <section className="track-page">
        <div className="page-heading">
          <span>TRACK YOUR REPORT</span>

          <h1>
            FOLLOW
            <br />
            <em>THE FIX.</em>
          </h1>

          <p>
            Enter your CivicFix report ID to see the
            latest information recorded for your report.
          </p>
        </div>

        <form
          className="track-search"
          onSubmit={(event) => {
            event.preventDefault();
            trackReport();
          }}
        >
          <Search size={20} />

          <input
            type="text"
            placeholder="Example: CF-2026-000001"
            value={reportId}
            onChange={(event) => {
              setReportId(event.target.value);
              setError("");
            }}
          />

          <button type="submit">
            Track Report
          </button>
        </form>

        {error && (
          <div className="location-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {!report && !error && (
          <div className="track-empty">
            <Clock3 size={40} />

            <h3>Enter your report ID</h3>

            <p>
              Your report ID is shown after you submit a
              CivicFix report. Enter it above to view the
              information saved for that report.
            </p>
          </div>
        )}

        {report && (
          <div className="tracking-card">
            <div className="tracking-header">
              <div>
                <span className="status progress">
                  {formatStatusLabel(currentStatus)}
                </span>

                <h2>
                  {report.title || "Civic Issue"}
                </h2>

                <p>
                  <MapPin size={14} />
                  {report.location?.address ||
                    "Location address unavailable"}
                </p>

                <p>
                  {report.category || "Category unavailable"}
                  {report.severity
                    ? ` · ${report.severity} severity`
                    : ""}
                </p>
              </div>

              <strong>{report.id}</strong>
            </div>

            <div className="review-description">
              <span>Description</span>
              <p>
                {report.description ||
                  "No description was provided."}
              </p>
            </div>

            <div className="review-item">
              <span>Photos</span>
              <strong>
                {Number(report.photoCount) || 0} photo
                {Number(report.photoCount) === 1 ? "" : "s"}
                {Number(report.photoCount) === 0
                  ? " recorded"
                  : " captured"}
              </strong>
            </div>

            <div className="timeline">
              {submittedEvent ? (
                <div className="timeline-step completed">
                  <div className="timeline-dot">
                    <Check size={13} />
                  </div>
                  <div>
                    <h4>Report Submitted</h4>
                    <p>
                      {formatDateTime(
                        submittedEvent.timestamp || report.createdAt
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                renderPendingStep("Report Submitted")
              )}

              {verifiedEvent ? (
                <div className="timeline-step completed">
                  <div className="timeline-dot">
                    <Check size={13} />
                  </div>
                  <div>
                    <h4>Report Verified</h4>
                    <p>{formatDateTime(verifiedEvent.timestamp)}</p>
                  </div>
                </div>
              ) : currentStatus === "rejected" && rejectedEvent ? (
                <div className="timeline-step current">
                  <div className="timeline-dot">
                    <AlertCircle size={13} />
                  </div>
                  <div>
                    <h4>Report Rejected</h4>
                    <p>
                      {formatDateTime(rejectedEvent.timestamp)}
                      {report.rejectionReason
                        ? ` · ${report.rejectionReason}`
                        : ""}
                    </p>
                  </div>
                </div>
              ) : (
                renderPendingStep(
                  "Report Verification",
                  "Pending verification"
                )
              )}

              {assignedEvent ? (
                <div className="timeline-step completed">
                  <div className="timeline-dot">
                    <Check size={13} />
                  </div>
                  <div>
                    <h4>Assigned</h4>
                    <p>
                      {formatDateTime(assignedEvent.timestamp)}
                      {report.assignment?.department
                        ? ` · ${report.assignment.department}`
                        : ""}
                    </p>
                  </div>
                </div>
              ) : (
                renderPendingStep("Assignment")
              )}

              {inProgressEvent ? (
                <div className="timeline-step completed">
                  <div className="timeline-dot">
                    <Check size={13} />
                  </div>
                  <div>
                    <h4>Work Started</h4>
                    <p>{formatDateTime(inProgressEvent.timestamp)}</p>
                  </div>
                </div>
              ) : (
                renderPendingStep("Work Started")
              )}

              {resolvedEvent ? (
                <div className="timeline-step completed">
                  <div className="timeline-dot">
                    <Check size={13} />
                  </div>
                  <div>
                    <h4>Resolved</h4>
                    <p>{formatDateTime(resolvedEvent.timestamp)}</p>
                  </div>
                </div>
              ) : (
                renderPendingStep("Resolved")
              )}
            </div>

            <div className="estimated">
              <Clock3 size={16} />
              <div>
                <strong>Current status</strong>
                <p>
                  {currentStatus === "submitted"
                    ? "Your report has been received and is waiting for verification."
                    : currentStatus === "verified"
                    ? "Your report has been verified and is waiting for assignment."
                    : currentStatus === "assigned"
                    ? "Your report has been assigned."
                    : currentStatus === "in_progress"
                    ? "Work has started on this problem."
                    : currentStatus === "resolved"
                    ? "This report has been marked as resolved."
                    : currentStatus === "rejected"
                    ? "This report was rejected."
                    : "Your report is being processed."}
                </p>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default TrackProblem;
