import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../services/api";
import "bootstrap/dist/css/bootstrap.min.css";

const SPECIALTIES = [
  "Cardiology", "Dermatology", "Neurology", "Pediatrics",
  "Orthopedics", "Psychiatry", "Oncology", "Urology",
];

function BookAppointment() {
  const [form, setForm] = useState({
    specialty: "",
    doctor: "",
    date: "",
    reason: "",
    attachment: null,
  });

  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [doctorAvailability, setDoctorAvailability] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get("/appointments/doctors", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setAllDoctors(res.data);
      } catch (err) {
        console.error("Failed to load doctors", err);
      }
    };

    fetchDoctors();
  }, []);

  useEffect(() => {
    if (!form.specialty) return setFilteredDoctors([]);
    const filtered = allDoctors.filter(
      (doc) => doc.specialty?.toLowerCase() === form.specialty.toLowerCase()
    );
    setFilteredDoctors(filtered);
  }, [form.specialty, allDoctors]);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!form.doctor) return setDoctorAvailability([]);
      try {
        const res = await axios.get(`/appointments/doctor/${form.doctor}/availability`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setDoctorAvailability(res.data);
      } catch (err) {
        console.error("Error fetching availability:", err);
        setDoctorAvailability([]);
      }
    };
    fetchAvailability();
  }, [form.doctor]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    setForm({ ...form, attachment: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append("doctor", form.doctor);
      data.append("date", form.date);
      data.append("reason", form.reason);
      if (form.attachment) {
        data.append("attachment", form.attachment);
      }

      await axios.post("/appointments", data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("✅ Appointment booked successfully.");
      navigate("/appointments");
    } catch (err) {
      alert("❌ Error booking appointment");
      console.error(err);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-primary mb-4">📅 Book an Appointment</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data" className="card p-4 shadow-sm">
        {/* Specialty */}
        <div className="mb-3">
          <label className="form-label">Specialty</label>
          <select
            className="form-select"
            name="specialty"
            value={form.specialty}
            onChange={handleChange}
            required
          >
            <option value="">-- Select Specialty --</option>
            {SPECIALTIES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Doctor */}
        <div className="mb-3">
          <label className="form-label">Doctor</label>
          <select
            className="form-select"
            name="doctor"
            value={form.doctor}
            onChange={handleChange}
            required
          >
            <option value="">-- Select Doctor --</option>
            {filteredDoctors.map((doc) => (
              <option key={doc._id} value={doc._id}>
                {doc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Doctor Availability */}
        {doctorAvailability.length > 0 && (
          <div className="mb-3">
            <div className="alert alert-secondary">
              <strong>Doctor Availability:</strong>
              <ul className="mb-0 mt-2">
                {doctorAvailability.map((slot, idx) => (
                  <li key={idx}>
                    {slot.day}: {slot.from} - {slot.to}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Date & Time */}
        <div className="mb-3">
          <label className="form-label">Appointment Date & Time</label>
          <input
            type="datetime-local"
            className="form-control"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
          />
        </div>

        {/* Reason */}
        <div className="mb-3">
          <label className="form-label">Reason</label>
          <input
            type="text"
            className="form-control"
            name="reason"
            placeholder="Enter reason for appointment"
            value={form.reason}
            onChange={handleChange}
            required
          />
        </div>

        {/* File Upload */}
        <div className="mb-3">
          <label className="form-label">Upload Report (optional)</label>
          <input
            type="file"
            className="form-control"
            name="attachment"
            onChange={handleFileChange}
          />
        </div>

        <button type="submit" className="btn btn-primary w-100">
          Submit Appointment
        </button>
      </form>
    </div>
  );
}

export default BookAppointment;
