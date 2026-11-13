import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ClipboardList, Clock3, CheckCircle2, Link2, Search, UserRound } from "lucide-react";
import { getCurrentUser } from "../auth/auth";
import "./UserDashboard.css";

const REPORTS_STORAGE_KEY = "civicfix_reports";

const getReports = () => {
  try {
    const raw = localStorage.getItem(REPORTS_STORAGE_KEY);
    const reports = raw ? JSON.parse(raw) : [];
    return Array.isArray(reports) ? reports : [];
  } catch (error) {
    return [];
  }
};

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
};

const statusLabel = (status) => {
  const labels = {
    submitted: "Submitted",
    verified: "Verified",
    assigned: "Assigned",
    in_progress: "In Progress",
    resolved: "Resolved",
    rejected: "Rejected",
  };
  return labels[status] || "Pending";
};

function UserDashboard() {
  const user = getCurrentUser();
  const [reports, setReports] = useState(getReports);
  const [reportId, setReportId] = useState("");
  const [message, setMessage] = useState("");

  const myReports = useMemo(
    () => reports.filter((report) => report.reportedBy === user?.email),
    [reports, user?.email]
  );

  const stats = useMemo(() => ({
    total: myReports.length,
    active: myReports.filter(
      (report) => !["resolved", "rejected"].includes(report.status)
    ).length,
    resolved: myReports.filter((report) => report.status === "resolved").length,
  }), [myReports]);

  const linkExistingReport = () => {
    const normalizedId = reportId.trim().toUpperCase();
    setMessage("");

    if (!normalizedId) {
      setMessage("Enter a report ID first.");
      return;
    }

    const allReports = getReports();
    const found = allReports.find(
      (report) => String(report.id || "").toUpperCase() === normalizedId
    );

    if (!found) {
      setMessage("That report ID was not found.");
      return;
    }

    if (found.reportedBy && found.reportedBy !== user?.email) {
      setMessage("That report is already linked to another account.");
      return;
    }

    const updated = allReports.map((report) =>
      report.id === found.id
        ? { ...report, reportedBy: user?.email, updatedAt: new Date().toISOString() }
        : report
    );

    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(updated));
    setReports(updated);
    setReportId("");
    setMessage("Report linked to your account successfully.");
  };

  return (
    <main className="page dashboard-page">
      <section className="dashboard-shell">
        <div className="dashboard-heading">
          <span>USER DASHBOARD</span>
          <h1>
            YOUR
            <br />
            <em>REPORTS.</em>
          </h1>
          <p>Welcome back, {user?.name || user?.email || "CivicFix user"}. Here is your activity and tracking overview.</p>
        </div>

        <div className="dashboard-stats">
          <div className="dashboard-stat"><ClipboardList size={18} /><strong>{stats.total}</strong><span>Total Reports</span></div>
          <div className="dashboard-stat"><Clock3 size={18} /><strong>{stats.active}</strong><span>Active</span></div>
          <div className="dashboard-stat"><CheckCircle2 size={18} /><strong>{stats.resolved}</strong><span>Resolved</span></div>
        </div>

        <div className="dashboard-grid">
          <section className="dashboard-panel large-panel">
            <div className="panel-heading">
              <div><span>MY REPORTS</span><h2>Recent activity</h2></div>
              <Link to="/track">Track a report <ArrowRight size={15} /></Link>
            </div>

            {myReports.length === 0 ? (
              <div className="dashboard-empty">
                <UserRound size={26} />
                <h3>No linked reports yet</h3>
                <p>Reports submitted while logged in or linked using an ID will appear here.</p>
                <Link className="dashboard-action" to="/report">Report a Problem <ArrowRight size={15} /></Link>
              </div>
            ) : (
              <div className="report-table-wrap">
                <table className="report-table">
                  <thead><tr><th>ID</th><th>Problem</th><th>Location</th><th>Status</th><th>Date</th></tr></thead>
                  <tbody>
                    {myReports.map((report) => (
                      <tr key={report.id}>
                        <td><Link to={`/track?report=${encodeURIComponent(report.id)}`}>{report.id}</Link></td>
                        <td>{report.title || report.problem || "Untitled"}</td>
                        <td>{report.location?.address || report.location || "Location unavailable"}</td>
                        <td><span className={`status-pill ${report.status}`}>{statusLabel(report.status)}</span></td>
                        <td>{formatDate(report.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="dashboard-panel">
            <div className="panel-heading"><div><span>LINK A REPORT</span><h2>Use an existing ID</h2></div><Link2 size={18} /></div>
            <p className="panel-copy">Reported before creating an account? Link that report to this account with its CivicFix ID.</p>
            <div className="link-report-form">
              <div className="auth-input-wrap"><Search size={16} /><input value={reportId} onChange={(event) => setReportId(event.target.value)} placeholder="CF-2026-000001" /></div>
              <button className="dashboard-action" type="button" onClick={linkExistingReport}>Link Report <ArrowRight size={15} /></button>
            </div>
            {message && <div className="dashboard-message">{message}</div>}
          </section>
        </div>
      </section>
    </main>
  );
}

export default UserDashboard;