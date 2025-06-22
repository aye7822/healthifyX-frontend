import { Link } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";


function Sidebar({ isOpen }) {
  const role = localStorage.getItem("role");

  return (
    <div className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
      <h5 className="text-primary">📋 Dashboard</h5>
      <ul className="nav flex-column gap-2">
        {role === "patient" && (
          <>
            <li><Link to="/profile" className="nav-link"><i className="bi bi-person-circle me-2" />Profile</Link></li>
            <li><Link to="/appointments" className="nav-link"><i className="bi bi-calendar-event me-2" />Appointments</Link></li>
            <li><Link to="/records" className="nav-link"><i className="bi bi-folder2-open me-2" />Records</Link></li>
            <li><Link to="/prescriptions" className="nav-link"><i className="bi bi-capsule-pill me-2" />Prescriptions</Link></li>
            <li><Link to="/records/analyze" className="nav-link"><i className="bi bi-bar-chart-line me-2" />Health Insights</Link></li>
          </>
        )}

        {role === "doctor" && (
          <>
            <li><Link to="/profile" className="nav-link"><i className="bi bi-person-badge me-2" />Doctor Profile</Link></li>
            <li><Link to="/appointments" className="nav-link"><i className="bi bi-calendar-check me-2" />Appointments</Link></li>
            <li><Link to="/records" className="nav-link"><i className="bi bi-journal-text me-2" />Patient Records</Link></li>
            <li><Link to="/prescriptions/add" className="nav-link"><i className="bi bi-plus-square me-2" />Write Prescription</Link></li>
            <li><Link to="/availability" className="nav-link"><i className="bi bi-clock-history me-2" />Availability</Link></li>
            <li><Link to="/records/analytics/:id" className="nav-link"><i className="bi bi-graph-up me-2" />Analytics</Link></li>
          </>
        )}

        {role === "admin" && (
          <>
            <li><Link to="/admin" className="nav-link"><i className="bi bi-tools me-2" />Admin Panel</Link></li>
            <li><Link to="/admin/appointments" className="nav-link"><i className="bi bi-journal-bookmark me-2" />All Appointments</Link></li>
            <li><Link to="/admin/records" className="nav-link"><i className="bi bi-archive me-2" />All Records</Link></li>
            <li><Link to="/admin/stats" className="nav-link"><i className="bi bi-pie-chart me-2" />System Stats</Link></li>
          </>
        )}
      </ul>
    </div>
  );
}

export default Sidebar;
