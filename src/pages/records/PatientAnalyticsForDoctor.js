import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../../services/api";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from "recharts";
import "bootstrap/dist/css/bootstrap.min.css";


function PatientAnalyticsForDoctor() {
  const { id } = useParams(); // patient ID
  const [records, setRecords] = useState([]);
  const [patient, setPatient] = useState(null);
  const [aiSummary, setAiSummary] = useState("");
  const [editableSummary, setEditableSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [savingSummary, setSavingSummary] = useState(false);


const fetchRecords = async () => {
  try {
    const res = await axios.get(`/records/patient/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    setRecords(res.data);

    if (res.data.length > 0) {
      setPatient(res.data[0].patient); // assuming record has patient populated
    }
  } catch (err) {
    console.error("Error fetching patient records", err);
  }
};


const fetchSavedSummary = async () => {
  try {
    const res = await axios.get(`/records/patient/${id}/summary`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    setAiSummary(res.data.summary);
  } catch (err) {
    console.error("Failed to load saved summary", err);
  }
};
  useEffect(() => {
  fetchRecords();
  fetchSavedSummary();
}, []);


  const generateSummary = async () => {
    setLoadingSummary(true);
    try {
      const res = await axios.post(`/api/ai/summary/${id}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setAiSummary(res.data.summary);
      setEditableSummary(res.data.summary);
    } catch (err) {
      console.error("AI summary generation failed", err);
      setAiSummary("⚠️ Failed to generate summary.");
    } finally {
      setLoadingSummary(false);
    }
  };

  const saveSummary = async () => {
    setSavingSummary(true);
    try {
      await axios.post(`/records/patient/${id}/save-summary`, {
        summary: editableSummary
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert("📝 Summary saved!");
    } catch (err) {
      console.error("Saving summary failed", err);
      alert("❌ Failed to save summary");
    } finally {
      setSavingSummary(false);
    }
  };

  const chartData = records.map((rec) => ({
    date: new Date(rec.createdAt).toLocaleDateString(),
    label: rec.diagnosis,
    treatmentLength: rec.treatment.length,
  }));

  const diagnosisFrequency = Object.entries(
    records.reduce((acc, r) => {
      acc[r.diagnosis] = (acc[r.diagnosis] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, count]) => ({ name, count }));

  return (
    <div className="container mt-5">
      <h2 className="text-primary mb-3">📈 Patient Health Analytics</h2>

      {patient && (
        <div className="alert alert-secondary">
          <strong>👤 Patient:</strong> {patient.name || "N/A"}
        </div>
      )}

      {/* AI Summary & Editable Text */}
      <div className="card mt-4 mb-4 p-3 shadow">
        <h5>🧠 AI-Generated Health Summary</h5>
        <button
          className="btn btn-outline-primary mb-2"
          onClick={generateSummary}
          disabled={loadingSummary}
        >
          {loadingSummary ? "Generating..." : "Generate Summary"}
        </button>

        {aiSummary && (
          <div className="mb-3">
            <label htmlFor="editableSummary" className="form-label">✏️ Edit Summary</label>
            <textarea
              className="form-control"
              rows={5}
              id="editableSummary"
              value={editableSummary}
              onChange={(e) => setEditableSummary(e.target.value)}
            />
            <button
              className="btn btn-success mt-2"
              onClick={saveSummary}
              disabled={savingSummary}
            >
              {savingSummary ? "Saving..." : "💾 Save Summary"}
            </button>
          </div>
        )}
      </div>

      {/* Charts and Table */}
      {records.length === 0 ? (
        <div className="alert alert-warning">No medical records available.</div>
      ) : (
        <>
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="card shadow-sm p-3">
                <h5 className="mb-3">📅 Records Over Time</h5>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid stroke="#ccc" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="treatmentLength" stroke="#007bff" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card shadow-sm p-3">
                <h5 className="mb-3">💊 Diagnoses Frequency</h5>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={diagnosisFrequency}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#28a745" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="card shadow p-3">
            <h5 className="mb-3">📋 Detailed Medical History</h5>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Diagnosis</th>
                  <th>Treatment</th>
                  <th>Report</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r._id}>
                    <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td>{r.diagnosis}</td>
                    <td>{r.treatment}</td>
                    <td>
                      {r.report ? (
                        <a
                          href={`http://localhost:5000/${r.report}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-secondary"
                        >
                          View
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default PatientAnalyticsForDoctor;
