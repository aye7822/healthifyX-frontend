import { useEffect, useState, useRef } from "react";
import axios from "../../services/api";
import { useDropzone } from "react-dropzone";
import { FaUserEdit, FaSave, FaMapMarkerAlt, FaHistory, FaUpload } from "react-icons/fa";
import { Link } from "react-router-dom";
import { CSSTransition } from "react-transition-group";
import "bootstrap/dist/css/bootstrap.min.css";


function PatientProfile() {
  const [form, setForm] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);

  const viewRef = useRef(null);
  const editRef = useRef(null);

  const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
    onDrop: (accepted) => setAvatarFile(accepted[0]),
    accept: { "image/*": [".jpg", ".jpeg", ".png"] },
    multiple: false,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("/user/me", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setForm({
          name: res.data.name || "",
          email: res.data.email || "",
          contact: res.data.contact || "",
          medicalHistory: res.data.medicalHistory || "",
          emergencyContact: res.data.emergencyContact || "",
          conditions: res.data.conditions || [],
          prescriptionFile: res.data.prescriptionFile || "",
        });
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleConditionChange = (e) => {
    const value = e.target.value;
    setForm({
      ...form,
      conditions: value.split(",").map((s) => s.trim()).filter(Boolean),
    });
  };

  const handlePdfChange = (e) => {
    setPdfFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(form).forEach(([key, val]) =>
      key === "conditions"
        ? data.append(key, JSON.stringify(val))
        : data.append(key, val)
    );
    if (avatarFile) data.append("avatar", avatarFile);
    if (pdfFile) data.append("prescriptionFile", pdfFile);

    try {
      await axios.put("/user/me", data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("✅ Profile updated!");
      setEditMode(false);
    } catch (err) {
      alert("❌ Failed to update profile.");
    }
  };

  const calculateProgress = () => {
    const keys = ["name", "email", "contact", "medicalHistory", "emergencyContact"];
    const filled = keys.filter((key) => form?.[key]);
    return Math.floor((filled.length / keys.length) * 100);
  };

  if (!form) return <div className="container mt-5">Loading...</div>;

  return (
    <div className="container mt-5 position-relative">
      {/* ✨ Internal fade animations */}
      


      {/* ✨ Background */}
      <div className="bg-overlay"></div>

      {/* 💳 Card with profile content */}
      <div className="card shadow-lg text-dark"
      style={{
              backgroundColor: "#f8f9fa",
                cursor: "pointer",
                backgroundImage: `url("/assets/patient.webp")`,
          backgroundSize: "contain",
          backgroundPosition: "center",
          borderRadius: "12px",
          }}
      >
        <div className="card-header bg-primary bg-opacity-75 text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">🙍 Patient Profile</h5>
        </div>

        <div className="card-body bg-white bg-opacity-75 rounded-bottom">
          {/* 👤 Avatar */}
          <div className="text-center mb-3"
              
          >
            <div
              {...getRootProps()}
              className="border rounded-circle mx-auto d-flex align-items-center justify-content-center"
              style={{
                width: 140,
                height: 140,
                overflow: "hidden",
                backgroundColor: "#f8f9fa",
                cursor: "pointer",
              }}
            >
              <input {...getInputProps()} />
              {avatarFile ? (
                <img
                  src={URL.createObjectURL(avatarFile)}
                  alt="Avatar"
                  className="img-fluid"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <small className="text-muted text-center">
                  Click to <br /> upload
                </small>
              )}
            </div>
            <small className="text-muted mt-2 d-block">Upload profile photo</small>
          </div>

          {/* 🔵 Progress */}
          <div className="progress mb-3" style={{ height: 8 }}>
            <div className="progress-bar" style={{ width: `${calculateProgress()}%` }} />
          </div>
          <small className="text-muted">{calculateProgress()}% profile completed</small>

          {/* 👁️ View Mode */}
          <CSSTransition in={!editMode} timeout={300} classNames="fade" unmountOnExit nodeRef={viewRef}>
            <div ref={viewRef}>
              <p><strong>Name:</strong> {form.name}</p>
              <p><strong>Email:</strong> {form.email}</p>
              <p><strong>Contact:</strong> {form.contact || "-"}</p>
              <p><strong>Emergency Contact:</strong> {form.emergencyContact || "-"}</p>
              <p><strong>Medical History:</strong> {form.medicalHistory || "-"}</p>
              <p><strong>Known Conditions:</strong>{" "}
                {form.conditions?.length ? form.conditions.map((c, i) => (
                  <span key={i} className="badge bg-info me-1">{c}</span>
                )) : "-"}
              </p>
              {form.prescriptionFile && (
                <p>
                  <strong>Prescription:</strong>{" "}
                  <a href={`http://localhost:5000/${form.prescriptionFile}`} target="_blank" rel="noreferrer">
                    📎 View File
                  </a>
                </p>
              )}
              <div className="d-flex flex-wrap gap-2 mt-3">
                <Link to="/appointments" className="btn btn-outline-success">
                  <FaHistory className="me-1" /> Appointment History
                </Link>
                <Link to="/set-location" className="btn btn-outline-info">
                  <FaMapMarkerAlt className="me-1" /> Update Location
                </Link>
                <button className="btn btn-outline-primary" onClick={() => setEditMode(true)}>
                  <FaUserEdit className="me-1" /> Edit Profile
                </button>
              </div>
            </div>
          </CSSTransition>

          {/* ✏️ Edit Mode */}
          <CSSTransition in={editMode} timeout={300} classNames="fade" unmountOnExit nodeRef={editRef}>
            <form ref={editRef} onSubmit={handleSubmit}>
              <div className="mb-2">
                <label>Name:</label>
                <input name="name" className="form-control" value={form.name} onChange={handleChange} required />
              </div>
              <div className="mb-2">
                <label>Email:</label>
                <input name="email" className="form-control" value={form.email} onChange={handleChange} required />
              </div>
              <div className="mb-2">
                <label>Contact:</label>
                <input name="contact" className="form-control" value={form.contact} onChange={handleChange} />
              </div>
              <div className="mb-2">
                <label>Emergency Contact:</label>
                <input name="emergencyContact" className="form-control" value={form.emergencyContact} onChange={handleChange} />
              </div>
              <div className="mb-2">
                <label>Medical History:</label>
                <textarea name="medicalHistory" className="form-control" rows={3} value={form.medicalHistory} onChange={handleChange} />
              </div>
              <div className="mb-2">
                <label>Known Conditions (comma-separated):</label>
                <input className="form-control" value={form.conditions.join(", ")} onChange={handleConditionChange} />
              </div>
              <div className="mb-3">
                <label><FaUpload className="me-1" /> Upload Prescription (PDF):</label>
                <input className="form-control" type="file" accept=".pdf" onChange={handlePdfChange} />
              </div>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-success">
                  <FaSave className="me-1" /> Save
                </button>
                <button className="btn btn-secondary" type="button" onClick={() => setEditMode(false)}>Cancel</button>
              </div>
            </form>
          </CSSTransition>
        </div>
      </div>
    </div>
  );
}

export default PatientProfile;
