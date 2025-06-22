import { useEffect, useState } from "react";
import axios from "../../services/api";

function PrescriptionAudit() {
  const [logs, setLogs] = useState([]);

 useEffect(() => {
  const fetchLogs = async () => {
    try {
      const res = await axios.get("/admin/prescription-logs", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setLogs(res.data);
    } catch (err) {
      console.error("Failed to fetch logs", err);
    }
  };

  fetchLogs(); // Initial load

  const interval = setInterval(fetchLogs, 5000); // Fetch every 5s

  return () => clearInterval(interval); // Cleanup on unmount
}, []);

  return (
    <div className="container mt-4">
      <h3 className="mb-3 text-primary">📜 Prescription Audit Trail</h3>
      {logs.length === 0 ? (
        <p>No logs found</p>
      ) : (
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Prescription</th>
              <th>Action</th>
              <th>By</th>
              <th>When</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log._id}>
                <td>{log.prescriptionId}</td>
                <td>{log.action}</td>
                <td>{log.performedBy?.name || log.performedBy}</td>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
                <td>{log.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default PrescriptionAudit;
