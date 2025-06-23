import { useEffect, useState ,useCallback} from "react";
import axios from "../../services/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";
import "bootstrap/dist/css/bootstrap.min.css";

function PatientHealthAnalysis() {
  const [records, setRecords] = useState([]);
  const token = localStorage.getItem("token");



  const fetchRecords = useCallback(async () => {
    try {
      const res = await axios.get("/records/mine", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecords(res.data);
    } catch (err) {
      console.error("Error loading records", err);
    }
  },[token])
  useEffect(() => {
    fetchRecords();
  },  [fetchRecords]);
  // Example metric mapping
  const chartData = records.map((rec, index) => ({
    name: `Visit ${index + 1}`,
    DiagnosisScore: rec.diagnosis.length,
    TreatmentScore: rec.treatment.length,
    date: new Date(rec.createdAt).toLocaleDateString(),
  }));

  const diagnosisFrequency = Object.entries(
    records.reduce((acc, r) => {
      acc[r.diagnosis] = (acc[r.diagnosis] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, count]) => ({ name, count }));

  return (
    <div className="container mt-4">
      <h3 className="mb-4 text-primary">📊 Your Health Analysis</h3>

      {records.length === 0 ? (
        <div className="alert alert-warning">No records found.</div>
      ) : (
        <>
          <div className="row mb-5">
            <div className="col-md-6 mb-4">
              <div className="card p-3 shadow-sm">
                <h5>📈 Health Trends Over Time</h5>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="DiagnosisScore"
                      stroke="#8884d8"
                      name="Diagnosis Length"
                    />
                    <Line
                      type="monotone"
                      dataKey="TreatmentScore"
                      stroke="#82ca9d"
                      name="Treatment Length"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="col-md-6 mb-4">
              <div className="card p-3 shadow-sm">
                <h5>📌 Diagnosis Frequency</h5>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={diagnosisFrequency}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#28a745" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="alert alert-info">
            🤖 <strong>AI Insight Placeholder:</strong> “Your last 3 records indicate recurring symptoms. You may want to consult your doctor for a follow-up.”
          </div>
        </>
      )}
    </div>
  );
}

export default PatientHealthAnalysis;
