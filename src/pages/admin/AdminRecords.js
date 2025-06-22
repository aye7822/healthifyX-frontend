import { useEffect, useState } from "react";
import axios from "../../services/api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "bootstrap/dist/css/bootstrap.min.css";

function AdminRecords() {
  const [records, setRecords] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filters, setFilters] = useState({
    doctor: "",
    startDate: "",
    endDate: ""
  });

  useEffect(() => {
    fetchDoctors();
    fetchRecords();
  }, []);

  const fetchDoctors = async () => {
    const res = await axios.get("/admin/users", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    const onlyDoctors = res.data.filter(u => u.role === "doctor" && u.status === "approved");
    setDoctors(onlyDoctors);
  };

  const fetchRecords = async () => {
    const res = await axios.get("/admin/records", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    setRecords(res.data);
    setFiltered(res.data);
  };

  const applyFilters = () => {
    const { doctor, startDate, endDate } = filters;
    let result = [...records];

    if (doctor) result = result.filter(r => r.doctor?._id === doctor);
    if (startDate) result = result.filter(r => new Date(r.createdAt) >= new Date(startDate));
    if (endDate) result = result.filter(r => new Date(r.createdAt) <= new Date(endDate));

    setFiltered(result);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Confirm delete this record?")) return;
    await axios.delete(`/admin/records/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    fetchRecords();
  };

  const exportToExcel = () => {
    const data = filtered.map((r) => ({
      Patient: r.patient?.name,
      Doctor: r.doctor?.name,
      Diagnosis: r.diagnosis,
      Treatment: r.treatment,
      Date: new Date(r.createdAt).toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "MedicalRecords");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const fileData = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(fileData, "MedicalRecords.xlsx");
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-primary">📁 Admin Medical Records</h2>

      {/* Filter Section */}
      <div className="card p-3 mb-4 shadow-sm">
        <div className="row g-2 align-items-end">
          <div className="col-md-4">
            <label>Filter by Doctor</label>
            <select
              className="form-select"
              value={filters.doctor}
              onChange={(e) => setFilters({ ...filters, doctor: e.target.value })}
            >
              <option value="">-- All Doctors --</option>
              {doctors.map((doc) => (
                <option key={doc._id} value={doc._id}>
                  {doc.name} ({doc.specialty})
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label>Start Date</label>
            <input
              type="date"
              className="form-control"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />
          </div>
          <div className="col-md-3">
            <label>End Date</label>
            <input
              type="date"
              className="form-control"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />
          </div>
          <div className="col-md-2 d-grid">
            <button onClick={applyFilters} className="btn btn-primary">Apply Filters</button>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="text-muted">Showing {filtered.length} records</h5>
        <button className="btn btn-success" onClick={exportToExcel}>📤 Export to Excel</button>
      </div>

      {filtered.length === 0 ? (
        <div className="alert alert-warning">No records found with current filters.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Diagnosis</th>
                <th>Treatment</th>
                <th>Report</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((rec) => (
                <tr key={rec._id}>
                  <td>{rec.patient?.name}</td>
                  <td>{rec.doctor?.name}</td>
                  <td>{rec.diagnosis}</td>
                  <td>{rec.treatment}</td>
                  <td>
                    {rec.report ? (
                      <a
                        href={`http://localhost:5000/${rec.report}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View
                      </a>
                    ) : "N/A"}
                  </td>
                  <td>{new Date(rec.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(rec._id)}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminRecords;
