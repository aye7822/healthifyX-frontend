import { useState, useEffect } from "react";
import API from "../../services/api";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

function AddMedicalRecord() {
  const [form, setForm] = useState({
    diagnosis: "",
    treatment: "",
    doctor: "",
  });
  const [doctors, setDoctors] = useState([]);
  const [file, setFile] = useState(null);

  useEffect(() => {
    API.get("/appointments/doctors", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => setDoctors(res.data))
      .catch((err) => console.error("Failed to load doctors", err));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    for (let key in form) data.append(key, form[key]);
    if (file) data.append("report", file);

    try {
      await API.post("/records", data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      alert("✅ Medical record uploaded!");
      setForm({ diagnosis: "", treatment: "", doctor: "" });
      setFile(null);
    } catch (err) {
      console.error("Upload failed", err);
      alert("❌ Failed to upload");
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow p-4">
        <h3 className="mb-4 text-primary">📄 Add Medical Record</h3>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="mb-3">
            <label className="form-label">Diagnosis</label>
            <input
              type="text"
              className="form-control"
              name="diagnosis"
              value={form.diagnosis}
              onChange={handleChange}
              required
              placeholder="e.g. Hypertension"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Treatment</label>
            <input
              type="text"
              className="form-control"
              name="treatment"
              value={form.treatment}
              onChange={handleChange}
              required
              placeholder="e.g. Medication + diet"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Select Doctor</label>
            <select
              className="form-select"
              name="doctor"
              value={form.doctor}
              onChange={handleChange}
              required
            >
              <option value="">-- Choose Doctor --</option>
              {doctors.map((doc) => (
                <option key={doc._id} value={doc._id}>
                  Dr. {doc.name} ({doc.specialty})
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Upload Report (optional)</label>
            <input
              type="file"
              className="form-control"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Upload Record
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddMedicalRecord;
