import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../../services/api";
import "bootstrap/dist/css/bootstrap.min.css";

// Utility: Extract tags from diagnosis
const getTagsFromDiagnosis = (text = "") => {
  const tags = [];
  const lower = text.toLowerCase();
  if (lower.includes("diabetes")) tags.push("Diabetes");
  if (lower.includes("hypertension")) tags.push("Hypertension");
  if (lower.includes("asthma")) tags.push("Asthma");
  if (lower.includes("cancer")) tags.push("Cancer");
  return tags;
};

// Utility: Determine severity level
const getSeverityLevel = (text = "") => {
  const lower = text.toLowerCase();
  if (lower.includes("mild")) return { label: "Mild", color: "success", desc: "Low concern, routine checkup recommended" };
  if (lower.includes("moderate")) return { label: "Moderate", color: "warning", desc: "Needs observation and possible medication" };
  if (lower.includes("severe")) return { label: "Severe", color: "danger", desc: "Urgent attention required" };
  return null;
};

function ViewMedicalRecords() {
  const [records, setRecords] = useState([]);
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [specialty, setSpecialty] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editedRecord, setEditedRecord] = useState({ diagnosis: "", treatment: "" });
  const [respondingId, setRespondingId] = useState(null);
  const [doctorNote, setDoctorNote] = useState("");

  useEffect(() => {
    if (role === "doctor") {
      fetchDoctorDetails();
      fetchDoctorRecords();
    } else {
      fetchPatientRecords();
    }

    // Initialize Bootstrap tooltips
    setTimeout(() => {
      const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
      [...tooltips].forEach((el) => new window.bootstrap.Tooltip(el));
    }, 300);
  }, [role]);

  const fetchPatientRecords = async () => {
    try {
      const res = await axios.get("/records/mine", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setRecords(res.data);
    } catch (err) {
      console.error("Failed to load patient records", err);
    }
  };

  const fetchDoctorRecords = async () => {
    try {
      const res = await axios.get("/records/doctor/mine", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setRecords(res.data);
    } catch (err) {
      console.error("Failed to load doctor records", err);
    }
  };

  const fetchDoctorDetails = async () => {
    try {
      const res = await axios.get("/user/me", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setSpecialty(res.data.specialty || "");
    } catch (err) {
      console.error("Failed to fetch doctor details", err);
    }
  };

  const startEdit = (record) => {
    setEditingId(record._id);
    setEditedRecord({ diagnosis: record.diagnosis, treatment: record.treatment });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditedRecord({ diagnosis: "", treatment: "" });
  };

  const saveEdit = async (id) => {
    try {
      await axios.patch(`/records/${id}`, editedRecord, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert("✅ Record updated");
      fetchPatientRecords();
      cancelEdit();
    } catch (err) {
      alert("❌ Failed to update record");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await axios.delete(`/records/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert("🗑️ Record deleted");
      fetchPatientRecords();
    } catch (err) {
      alert("❌ Failed to delete record");
    }
  };

  const startRespond = (record) => {
    setRespondingId(record._id);
    setDoctorNote(record.doctorNote || "");
  };

  const cancelRespond = () => {
    setRespondingId(null);
    setDoctorNote("");
  };

  const submitDoctorNote = async (id) => {
    try {
      await axios.patch(`/records/respond/${id}`, { doctorNote }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert("✅ Doctor note saved");
      fetchDoctorRecords();
      cancelRespond();
    } catch (err) {
      alert("❌ Failed to submit note");
    }
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="text-primary">📋 Medical Records</h3>
        {role === "patient" && (
          <div>
            <Link to="/records/add" className="btn btn-success">➕ Add Record</Link>
            <Link to="/records/analyze" className="btn btn-outline-info ms-2">📊 Health Insights</Link>
          </div>
        )}
      </div>

      {role === "doctor" && specialty && (
        <div className="alert alert-info">
          <strong>Specialty:</strong> {specialty}
        </div>
      )}

      {records.length === 0 ? (
        <div className="alert alert-warning">No medical records found.</div>
      ) : (
        <div className="row">
          {records.map((r) => {
            const tags = getTagsFromDiagnosis(r.diagnosis);
            const severity = getSeverityLevel(r.diagnosis);

            return (
              <div key={r._id} className="col-md-6 mb-4">
                <div className="card shadow-sm h-100">
                  <div className="card-body">
                    <h5 className="card-title">🧾 Diagnosis</h5>
                    {editingId === r._id ? (
                      <input
                        className="form-control mb-2"
                        value={editedRecord.diagnosis}
                        onChange={(e) => setEditedRecord({ ...editedRecord, diagnosis: e.target.value })}
                      />
                    ) : (
                      <p>{r.diagnosis}</p>
                    )}

                    {/* Tags */}
                    {tags.length > 0 && (
                      <div className="mb-2">
                        {tags.map((tag, i) => (
                          <span key={i} className="badge bg-secondary me-1">{tag}</span>
                        ))}
                      </div>
                    )}

                    {/* Severity Badge w/ Tooltip */}
                    {severity && (
                      <span
                        className={`badge bg-${severity.color} mb-2`}
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        title={severity.desc}
                      >
                        🔥 Severity: {severity.label}
                      </span>
                    )}

                    <h6 className="mt-2">💊 Treatment</h6>
                    {editingId === r._id ? (
                      <input
                        className="form-control"
                        value={editedRecord.treatment}
                        onChange={(e) => setEditedRecord({ ...editedRecord, treatment: e.target.value })}
                      />
                    ) : (
                      <p>{r.treatment}</p>
                    )}

                    <p className="mt-2">
                      {role === "patient" && (
                        <><strong>👨‍⚕️ Doctor:</strong> {r.doctor?.name || "N/A"}<br /></>
                      )}
                      {role === "doctor" && (
                        <><strong>👤 Patient:</strong> {r.patient?.name || "N/A"}<br /></>
                      )}
                      <strong>📅 Date:</strong> {new Date(r.createdAt).toLocaleDateString()}
                    </p>

                    {r.report && (
                      <a
                        href={`http://localhost:5000/${r.report}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline-secondary me-2"
                      >
                        📎 View Report
                      </a>
                    )}

                    {/* Patient Buttons */}
                    {role === "patient" && (
                      editingId === r._id ? (
                        <>
                          <button className="btn btn-sm btn-success me-2" onClick={() => saveEdit(r._id)}>Save</button>
                          <button className="btn btn-sm btn-secondary" onClick={cancelEdit}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button className="btn btn-sm btn-warning me-2" onClick={() => startEdit(r)}>✏️ Edit</button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(r._id)}>🗑️ Delete</button>
                        </>
                      )
                    )}

                    {/* Doctor Response */}
                    {role === "doctor" && (
                      <>
                        {respondingId === r._id ? (
                          <>
                            <textarea
                              className="form-control mt-2"
                              value={doctorNote}
                              onChange={(e) => setDoctorNote(e.target.value)}
                              rows={3}
                              placeholder="Type your response here..."
                            />
                            <button
                              className="btn btn-sm btn-success mt-2 me-2"
                              onClick={() => submitDoctorNote(r._id)}
                            >
                              Save Note
                            </button>
                            <button
                              className="btn btn-sm btn-secondary mt-2"
                              onClick={cancelRespond}
                            >
                              Cancel
                            </button>
                          </>
                        ) : r.doctorNote ? (
                          <p className="mt-2"><strong>📝 Doctor Note:</strong> {r.doctorNote}</p>
                        ) : (
                          <button
                            className="btn btn-sm btn-outline-warning mt-2"
                            onClick={() => startRespond(r)}
                          >
                            💬 Add Note
                          </button>
                        )}

                        <Link
                          to={`/records/analytics/${r.patient?._id}`}
                          className="btn btn-sm btn-outline-primary mt-2 ms-2"
                        >
                          🔍 Analyze
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ViewMedicalRecords;
