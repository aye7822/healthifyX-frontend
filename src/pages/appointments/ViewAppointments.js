import { useEffect, useState,useCallback } from "react";
import axios from "../../services/api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "bootstrap/dist/css/bootstrap.min.css";

function ViewAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [rescheduleMessage, setRescheduleMessage] = useState("");
  const [activeApptId, setActiveApptId] = useState(null);
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  const fetchAppointments =useCallback( async () => {
    try {
      const res = await axios.get("/appointments/mine", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(res.data);
    } catch (err) {
      console.error("Failed to load appointments", err);
    }
  },[token])

  const handleConfirm = async (id) => {
    try {
      await axios.put(`/appointments/${id}/confirm`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Appointment confirmed");
      fetchAppointments();
    } catch (err) {
      console.error("Confirmation failed", err);
    }
  };

  const handleCancel = async (id) => {
    try {
      await axios.put(`/appointments/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Appointment cancelled");
      fetchAppointments();
    } catch (err) {
      console.error("Cancel failed", err);
    }
  };

  const handleReschedulePatient = async (id) => {
    try {
      await axios.put(`/appointments/${id}/reschedule`, {
        date: selectedDate,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Appointment rescheduled");
      setSelectedDate(null);
      setActiveApptId(null);
      fetchAppointments();
    } catch (err) {
      console.error("Reschedule failed", err);
    }
  };

  const handleRescheduleEmail = async (id) => {
    try {
      await axios.post(`/appointments/${id}/suggest-reschedule`, {
        suggestedDate: selectedDate,
        message: rescheduleMessage,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Reschedule suggestion sent.");
      setSelectedDate(null);
      setRescheduleMessage("");
      setActiveApptId(null);
    } catch (err) {
      console.error("Failed to send reschedule email", err);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return (
    <>
    <div className="container mt-4">
      <h2 className="mb-4">📅 My Appointments</h2>

      {appointments.length === 0 ? (
        <div className="alert alert-info">No appointments found.</div>
      ) : (
        <div className="row">
          {appointments.map((appt) => (
            <div key={appt._id} className="col-md-6 mb-4">
              <div className="card shadow">
                <div className="card-body">
                  <h5 className="card-title">
                    {new Date(appt.date).toLocaleString()}
                  </h5>
                  <p className="card-text">
                    <strong>Reason:</strong> {appt.reason}<br />
                    <strong>Doctor:</strong> {appt.doctor?.name || "-"}<br />
                    <strong>Patient:</strong> {appt.patient?.name || "-"}<br />
                    <strong>Status:</strong>{" "}
                    <span className={`badge bg-${appt.status === "confirmed" ? "success" : appt.status === "cancelled" ? "danger" : "secondary"}`}>
                      {appt.status}
                    </span>
                  </p>

                  {/* ✅ Doctor Buttons */}
                  {role === "doctor" && (
                    <>
                      {appt.status === "pending" && (
                        <button className="btn btn-success btn-sm me-2" onClick={() => handleConfirm(appt._id)}>
                          Confirm
                        </button>
                      )}
                      <button className="btn btn-warning btn-sm me-2" onClick={() => setActiveApptId(appt._id)}>
                        Reschedule Email
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleCancel(appt._id)}>
                        Cancel
                      </button>
                    </>
                  )}

                  {/* ✅ Patient Reschedule */}
                  {role === "patient" && (
                    <button className="btn btn-primary btn-sm" onClick={() => setActiveApptId(appt._id)}>
                      Reschedule
                    </button>
                  )}

                  {/* Reschedule Section */}
                  {activeApptId === appt._id && (
                    <div className="mt-3">
                      <label className="form-label">New Date & Time:</label>
                      <DatePicker
                        selected={selectedDate}
                        onChange={(date) => setSelectedDate(date)}
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={30}
                        dateFormat="yyyy-MM-dd h:mm aa"
                        className="form-control"
                        placeholderText="Select date"
                      />
                      {role === "doctor" && (
                        <>
                          <label className="form-label mt-2">Message to patient:</label>
                          <textarea
                            className="form-control"
                            rows={2}
                            value={rescheduleMessage}
                            onChange={(e) => setRescheduleMessage(e.target.value)}
                          />
                          <button className="btn btn-info btn-sm mt-2" onClick={() => handleRescheduleEmail(appt._id)}>
                            Send Reschedule Email
                          </button>
                        </>
                      )}
                      {role === "patient" && (
                        <button className="btn btn-info btn-sm mt-2" onClick={() => handleReschedulePatient(appt._id)}>
                          Submit Reschedule
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </>
  );
}

export default ViewAppointments;
