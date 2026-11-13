import { useMemo, useState, useEffect } from "react";
import { AlertCircle, CheckCircle2, Clock3, ShieldCheck, Wrench, Search, ChevronRight } from "lucide-react";
import { getCurrentUser } from "../auth/auth";
import "./UserDashboard.css";
import "./AdminDashboard.css";

const REPORTS_STORAGE_KEY = "civicfix_reports";
const STATUS_ORDER = ["submitted", "verified", "assigned", "in_progress", "resolved", "rejected"];

const getReports = () => {
  try {
    const raw = localStorage.getItem(REPORTS_STORAGE_KEY);
    const reports = raw ? JSON.parse(raw) : [];
    return Array.isArray(reports) ? reports : [];
  } catch (error) {
    return [];
  }
};

const writeReports = (reports) => {
  localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
  window.dispatchEvent(new Event("civicfix-reports-changed"));
};

const formatDateTime = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
};

const label = (status) => ({
  submitted: "Submitted",
  verified: "Verified",
  assigned: "Assigned",
  in_progress: "In Progress",
  resolved: "Resolved",
  rejected: "Rejected",
}[status] || "Pending");

const eventLabel = (status) => ({
  submitted: "Report Submitted",
  verified: "Report Verified",
  assigned: "Assigned",
  in_progress: "Work Started",
  resolved: "Resolved",
  rejected: "Report Rejected",
}[status] || status);

function AdminDashboard() {
  const user = getCurrentUser();
  const [reports, setReports] = useState(getReports);
  const [selectedId, setSelectedId] = useState("");
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (reports.length > 0 && !selectedId) {
      setSelectedId(reports[0].id);
    }
  }, [reports, selectedId]);

  const filteredReports = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return reports;
    return reports.filter((report) =>
      [report.id, report.title, report.category, report.location?.address]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [reports, search]);

  const selectedReport = reports.find((report) => report.id === selectedId) || null;

  const stats = useMemo(() => ({
    total: reports.length,
    pending: reports.filter((report) => report.status === "submitted").length,
    progress: reports.filter((report) => ["verified", "assigned", "in_progress"].includes(report.status)).length,
    resolved: reports.filter((report) => report.status === "resolved").length,
  }), [reports]);

  const changeStatus = (nextStatus) => {
    if (!selectedReport) return;
    setMessage("");

    if (nextStatus === "assigned" && !department.trim()) {
      setMessage("Enter a department before assigning this report.");
      return;
    }

    if (nextStatus === "rejected" && !rejectionReason.trim()) {
      setMessage("Enter a rejection reason.");
      return;
    }

    const now = new Date().toISOString();
    const updatedReports = reports.map((report) => {
      if (report.id !== selectedReport.id) return report;

      const timeline = Array.isArray(report.timeline) ? [...report.timeline] : [];
      const alreadyExists = timeline.some((event) => event.status === nextStatus);
      if (!alreadyExists) {
        timeline.push({
          status: nextStatus,
          label: eventLabel(nextStatus),
          timestamp: now,
        });
      }

      const next = {
        ...report,
        status: nextStatus,
        updatedAt: now,
        timeline,
      };

      if (nextStatus === "verified") {
        next.verification = { ...(report.verification || {}), status: "verified", verifiedAt: now };
      }
      if (nextStatus === "assigned") {
        next.assignment = { ...(report.assignment || {}), department: department.trim(), assignedAt: now };
      }
      if (nextStatus === "in_progress") next.workStartedAt = now;
      if (nextStatus === "resolved") next.resolvedAt = now;
      if (nextStatus === "rejected") {
        next.rejectionReason = rejectionReason.trim();
        next.verification = { ...(report.verification || {}), status: "rejected", verifiedAt: null };
      }

      return next;
    });

    writeReports(updatedReports);
    setReports(updatedReports);
    setDepartment("");
    setRejectionReason("");
    setMessage(`${selectedReport.id} updated to ${label(nextStatus)}.`);
  };

  const availableNextStatuses = () => {
    if (!selectedReport) return [];
    if (selectedReport.status === "rejected" || selectedReport.status === "resolved") return [];
    const currentIndex = STATUS_ORDER.indexOf(selectedReport.status);
    return STATUS_ORDER.slice(currentIndex + 1).filter((status) => status !== "rejected");
  };

  return (
    <main className="page dashboard-page">
      <section className="dashboard-shell">
        <div className="dashboard-heading admin-heading">
          <span>ADMIN DASHBOARD</span>
          <h1>
            MANAGE
            <br />
            <em>CIVICFIX.</em>
          </h1>
          <p>Signed in as {user?.email || "Admin"}. Update actions and monitor live municipal queues.</p>
        </div>

        <div className="dashboard-stats">
          <div className="dashboard-stat"><ShieldCheck size={18} /><strong>{stats.total}</strong><span>Total Reports</span></div>
          <div className="dashboard-stat"><Clock3 size={18} /><strong>{stats.pending}</strong><span>Pending Verification</span></div>
          <div className="dashboard-stat"><Wrench size={18} /><strong>{stats.progress}</strong><span>Active</span></div>
          <div className="dashboard-stat"><CheckCircle2 size={18} /><strong>{stats.resolved}</strong><span>Resolved</span></div>
        </div>

        <div className="admin-grid">
          <section className="dashboard-panel">
            <div className="panel-heading"><div><span>REPORT QUEUE</span><h2>All reports</h2></div><strong>{filteredReports.length}</strong></div>
            <div className="admin-search auth-input-wrap"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search ID, title, category..." /></div>
            {filteredReports.length === 0 ? (
              <div className="dashboard-empty"><AlertCircle size={26} /><h3>No reports found</h3><p>New public reports will appear here.</p></div>
            ) : (
              <div className="admin-report-list">
                {filteredReports.map((report) => (
                  <button
                    key={report.id}
                    type="button"
                    className={`admin-report-row ${selectedId === report.id ? "active" : ""}`}
                    onClick={() => setSelectedId(report.id)}
                  >
                    <div><strong>{report.id}</strong><span>{report.title || report.problem || "Untitled Issue"}</span></div>
                    <span className={`status-pill ${report.status}`}>{label(report.status)}</span>
                    <ChevronRight size={16} />
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="dashboard-panel admin-detail-panel">
            {!selectedReport ? (
              <div className="dashboard-empty"><ShieldCheck size={26} /><h3>Select a report</h3><p>Choose a report from the queue to manage it.</p></div>
            ) : (
              <div>
                <div className="panel-heading">
                  <div><span>REPORT DETAILS</span><h2>{selectedReport.title || selectedReport.problem || selectedReport.id}</h2></div>
                  <span className={`status-pill ${selectedReport.status}`}>{label(selectedReport.status)}</span>
                </div>
                <div className="detail-grid">
                  <div><small>REPORT ID</small><strong>{selectedReport.id}</strong></div>
                  <div><small>CATEGORY</small><strong>{selectedReport.category || "General"}</strong></div>
                  <div><small>SEVERITY</small><strong>{selectedReport.severity || "Normal"}</strong></div>
                  <div><small>SUBMITTED</small><strong>{formatDateTime(selectedReport.createdAt)}</strong></div>
                  <div className="detail-full"><small>LOCATION</small><strong>{selectedReport.location?.address || selectedReport.location || "Location unavailable"}</strong></div>
                  <div className="detail-full"><small>DESCRIPTION</small><p>{selectedReport.description || "No description provided."}</p></div>
                </div>

                <div className="admin-timeline">
                  <span>RECORDED TIMELINE</span>
                  {(selectedReport.timeline || []).map((event) => (
                    <div key={`${event.status}-${event.timestamp}`} className="admin-timeline-row">
                      <CheckCircle2 size={15} />
                      <div><strong>{event.label}</strong><span>{formatDateTime(event.timestamp)}</span></div>
                    </div>
                  ))}
                </div>

                <div className="admin-actions">
                  <span>UPDATE STATUS</span>
                  {availableNextStatuses().map((status) => (
                    <div className="status-action" key={status}>
                      {status === "assigned" && (
                        <input value={department} onChange={(event) => setDepartment(event.target.value)} placeholder="Department name" />
                      )}
                      <button type="button" className="dashboard-action" onClick={() => changeStatus(status)}>{label(status)}</button>
                    </div>
                  ))}
                  {selectedReport.status !== "rejected" && selectedReport.status !== "resolved" && (
                    <div className="status-action rejection-action">
                      <input value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} placeholder="Reason if rejecting" />
                      <button type="button" className="danger-action" onClick={() => changeStatus("rejected")}>Reject</button>
                    </div>
                  )}
                </div>
                {message && <div className="dashboard-message">{message}</div>}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

export default AdminDashboard;