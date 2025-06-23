import { useEffect, useState, useRef } from "react";
import { useDropzone } from "react-dropzone";
import axios from "../../services/api";
import { FaUserEdit, FaSave } from "react-icons/fa";
import { QRCodeCanvas } from "qrcode.react";
import { CSSTransition } from "react-transition-group";
import "bootstrap/dist/css/bootstrap.min.css";

const specialties = [
  { name: "Cardiology", icon: "❤️" },
  { name: "Neurology", icon: "🧠" },
  { name: "Pediatrics", icon: "🧒" },
  { name: "Dermatology", icon: "🧴" },
  { name: "Oncology", icon: "🎗️" },
  { name: "Psychiatry", icon: "🧘" },
  { name: "General Medicine", icon: "🏥" },
];

function DoctorProfile() {
  const [form, setForm] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [file, setFile] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");

  const viewRef = useRef(null);
  const editRef = useRef(null);

  const rating = 4.8;
  const feedbacks = [
    "Doctor is very kind and professional!",
    "Excellent experience and good follow-up!",
    "Super knowledgeable and empathetic.",
  ];

  const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
    onDrop: (accepted) => setFile(accepted[0]),
    accept: { "image/*": [".jpg", ".jpeg", ".png"] },
    multiple: false,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("/user/me", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setForm(res.data);
      } catch (err) {
        console.error("Failed to fetch doctor profile", err);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(form).forEach(([key, val]) => data.append(key, val));
    if (file) data.append("licenseFile", file);

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
      alert("❌ Failed to update");
    }
  };

  const calculateProgress = () => {
    const fields = ["name", "email", "specialty", "licenseNumber"];
    const filled = fields.filter((f) => form?.[f]);
    return Math.floor((filled.length / fields.length) * 100);
  };

  if (!form) return <div className="container mt-5">Loading...</div>;

  return (
    <div className="container mt-5">
      {/* Internal animation style */}
      <style>{`
        .fade-enter {
          opacity: 0;
          transform: scale(0.95);
        }
        .fade-enter-active {
          opacity: 1;
          transform: scale(1);
          transition: all 300ms ease;
        }
        .fade-exit {
          opacity: 1;
        }
        .fade-exit-active {
          opacity: 0;
          transform: scale(0.95);
          transition: all 300ms ease;
        }
      `}</style>

      <div
        className="card shadow-sm mb-4"
         style={{
              backgroundColor: "#f8f9fa",
                cursor: "pointer",
                backgroundImage: `url("/assets/doctor.jpg")`,
          backgroundSize: "contain",
          backgroundPosition: "center",
          borderRadius: "12px",
          }}>
        <div className="card-header bg-dark bg-opacity-75 text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">👨‍⚕️ Doctor Profile</h5>
          <span
            className={`badge bg-${form.status === "approved"
              ? "success"
              : form.status === "pending"
              ? "warning"
              : "danger"
              }`}
          >
            {form.status?.toUpperCase()}
          </span>
        </div>

        <div className="card-body bg-white bg-opacity-75 rounded-bottom">
          {/* Avatar Upload */}
          <div className="text-center mb-3">
            <div
              {...getRootProps()}
              className="border rounded-circle mx-auto d-flex align-items-center justify-content-center position-relative"
              style={{
                width: 140,
                height: 140,
                overflow: "hidden",
              
              }}
            >
              <input {...getInputProps()} />
              {acceptedFiles[0] ? (
                <img
                  src={URL.createObjectURL(acceptedFiles[0])}
                  alt="Profile"
                  className="img-fluid"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <small className="text-muted text-center">
                  Click to <br /> upload
                </small>
              )}
            </div>
          </div>

          <div className="progress mt-3" style={{ height: 8 }}>
            <div
              className="progress-bar"
              style={{ width: `${calculateProgress()}%` }}
              role="progressbar"
            />
          </div>
          <small className="text-muted">{calculateProgress()}% profile completed</small>

          {/* Profile View/Edit */}
          <CSSTransition in={!editMode} timeout={300} classNames="fade" unmountOnExit nodeRef={viewRef}>
            <div ref={viewRef}>
              <p><strong>Name:</strong> {form.name}</p>
              <p><strong>Email:</strong> {form.email}</p>
              <p><strong>Specialty:</strong> <span className="badge bg-info">{form.specialty}</span></p>
              <p><strong>License Number:</strong> {form.licenseNumber}</p>
              {form.licenseFile && (
                <p><strong>License:</strong> <a href={`http://localhost:5000/${form.licenseFile}`} target="_blank" rel="noreferrer">View</a></p>
              )}
              <button className="btn btn-outline-primary" onClick={() => setEditMode(true)}>
                <FaUserEdit className="me-1" /> Edit
              </button>
            </div>
          </CSSTransition>

          <CSSTransition in={editMode} timeout={300} classNames="fade" unmountOnExit nodeRef={editRef}>
            <form ref={editRef} onSubmit={handleSubmit}>
              <div className="mb-2">
                <label>Name:</label>
                <input className="form-control" name="name" value={form.name} onChange={handleChange} required />
              </div>
              <div className="mb-2">
                <label>Email:</label>
                <input className="form-control" name="email" value={form.email} onChange={handleChange} required />
              </div>
              <div className="mb-2">
                <label>Specialty:</label>
                <select className="form-select" name="specialty" value={form.specialty} onChange={handleChange} required>
                  <option value="">-- Select --</option>
                  {specialties.map((s) => (
                    <option key={s.name} value={s.name}>{s.icon} {s.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-2">
                <label>License Number:</label>
                <input className="form-control" name="licenseNumber" value={form.licenseNumber} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label>License File:</label>
                <input className="form-control" type="file" onChange={(e) => setFile(e.target.files[0])} />
              </div>
              <button className="btn btn-success me-2" type="submit"><FaSave className="me-1" /> Save</button>
              <button className="btn btn-secondary" type="button" onClick={() => setEditMode(false)}>Cancel</button>
            </form>
          </CSSTransition>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "reviews" ? "active" : ""}`} onClick={() => setActiveTab("reviews")}>⭐ Reviews</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "schedule" ? "active" : ""}`} onClick={() => setActiveTab("schedule")}>📅 Schedule</button>
        </li>
      </ul>

      <div className="tab-content">
        {activeTab === "reviews" && (
          <div className="tab-pane fade show active">
            <h5>⭐ Average Rating: {rating} / 5</h5>
            <ul className="list-group">
              {feedbacks.map((fb, idx) => (
                <li key={idx} className="list-group-item">{fb}</li>
              ))}
            </ul>
          </div>
        )}
        {activeTab === "schedule" && (
          <div className="tab-pane fade show active">
            <p>🕒 You can manage your availability <a href="/availability">here</a>.</p>
          </div>
        )}
      </div>

      {/* QR Code */}
      <div className="text-center mt-4">
        <p>📄 Download Sample Prescription</p>
        <QRCodeCanvas value="http://localhost:5000/prescriptions/sample.pdf" size={120} />
      </div>
    </div>
  );
}

export default DoctorProfile;
