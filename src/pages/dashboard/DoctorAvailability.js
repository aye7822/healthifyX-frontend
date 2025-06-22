import { useState, useEffect } from "react";
import axios from "../../services/api";
import { FaTrashAlt, FaPlusCircle, FaClock } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

const WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function DoctorAvailability() {
  const [availability, setAvailability] = useState([]);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("/user/me", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setAvailability(res.data.availability || []);
      } catch (err) {
        setErrorMsg("❌ Failed to load availability");
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (index, field, value) => {
    const updated = [...availability];
    updated[index][field] = value;
    setAvailability(updated);
  };

  const handleAdd = () => {
    setAvailability([...availability, { day: "", from: "", to: "" }]);
  };

  const handleRemove = (index) => {
    setAvailability(availability.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put("/user/availability", { availability }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setSuccessMsg("✅ Availability updated successfully!");
      setErrorMsg("");
    } catch (err) {
      setErrorMsg("❌ Error saving availability");
      setSuccessMsg("");
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h4><FaClock className="me-2" />Set Your Weekly Availability</h4>
        </div>

        <div className="card-body">
          {successMsg && <div className="alert alert-success">{successMsg}</div>}
          {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

          <form onSubmit={handleSubmit}>
            {availability.map((slot, index) => (
              <div className="row mb-3 align-items-center" key={index}>
                <div className="col-md-3">
                  <select
                    className="form-select"
                    value={slot.day}
                    onChange={(e) => handleChange(index, "day", e.target.value)}
                    required
                  >
                    <option value="">Select Day</option>
                    {WEEK_DAYS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-3">
                  <input
                    type="time"
                    className="form-control"
                    value={slot.from}
                    onChange={(e) => handleChange(index, "from", e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-3">
                  <input
                    type="time"
                    className="form-control"
                    value={slot.to}
                    onChange={(e) => handleChange(index, "to", e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-2">
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => handleRemove(index)}
                  >
                    <FaTrashAlt /> Remove
                  </button>
                </div>
              </div>
            ))}

            <div className="d-flex justify-content-between align-items-center mt-4">
              <button type="button" className="btn btn-outline-primary" onClick={handleAdd}>
                <FaPlusCircle className="me-2" /> Add Time Slot
              </button>

              <button type="submit" className="btn btn-success">
                ✅ Save Availability
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default DoctorAvailability;
