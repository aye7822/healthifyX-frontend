import { useEffect, useState } from "react";
import API from "../../services/api";
import { saveAs } from "file-saver";
import { Modal, Button, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

function ViewPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState(null);
  const [editedNotes, setEditedNotes] = useState("");
  const [editedMedications, setEditedMedications] = useState("");
  const [signature, setSignature] = useState(null);
  const role = localStorage.getItem("role");

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const res = await API.get("/prescriptions", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setPrescriptions(res.data);
    } catch (err) {
      console.error("Failed to fetch prescriptions", err);
    }
  };

  const downloadPDF = (url) => {
    saveAs(url, "prescription.pdf");
  };

  const daysLeft = (createdAt) => {
    const expiryDate = new Date(createdAt);
    expiryDate.setDate(expiryDate.getDate() + 30);
    const days = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} days left` : "Expired";
  };

  const openEditModal = (prescription) => {
    setEditingPrescription(prescription);
    const meds = Array.isArray(prescription.medications)
      ? prescription.medications.map(m => `${m.name} (${m.dosage})`).join(", ")
      : prescription.medications;
    setEditedNotes(prescription.notes || "");
    setEditedMedications(meds || "");
    setShowModal(true);
  };

  const handleUpdate = async () => {
    const formData = new FormData();
    formData.append("notes", editedNotes);
    formData.append("medications", editedMedications);
    if (signature) formData.append("signature", signature);

    try {
      await API.put(`/prescriptions/${editingPrescription._id}`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("✅ Prescription updated");
      setShowModal(false);
      fetchPrescriptions();
    } catch (err) {
      alert("❌ Update failed");
      console.error(err);
    }
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="text-primary">
          {role === "doctor"
            ? "👨‍⚕️ Prescriptions You Issued"
            : role === "admin"
            ? "📋 All Prescriptions"
            : "💊 Your Prescriptions"}
        </h3>
        {role === "admin" && (
          <Link to="/admin/prescription-audit" className="btn btn-sm btn-outline-secondary">
            📜 Audit Logs
          </Link>
        )}
      </div>

      {prescriptions.length === 0 ? (
        <div className="alert alert-warning">No prescriptions found.</div>
      ) : (
        <div className="row">
          {prescriptions.map((p) => (
            <div className="col-md-6 mb-4" key={p._id}>
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">
                    🧾 Prescription by {p.doctor?.name || "N/A"}
                  </h5>
                  <p className="card-text">
                    <strong>Patient:</strong> {p.patient?.name || "N/A"} <br />
                    <strong>Medications:</strong>{" "}
                    {Array.isArray(p.medications) ? (
                      p.medications.map((m, i) => (
                        <span key={i} className="badge bg-info me-1">
                          {m.name} ({m.dosage})
                        </span>
                      ))
                    ) : (
                      <span className="text-muted">{p.medications || "N/A"}</span>
                    )}
                    <br />
                    <strong>Notes:</strong> {p.notes}<br />
                    <strong>Issued:</strong>{" "}
                    {new Date(p.createdAt).toLocaleDateString()}<br />
                    {role !== "admin" && (
                      <strong>
                        ⏰ Status:{" "}
                        <span
                          className={daysLeft(p.createdAt).includes("Expired")
                            ? "text-danger"
                            : "text-success"}
                        >
                          {daysLeft(p.createdAt)}
                        </span>
                      </strong>
                    )}
                  </p>

                  {p.file && (
                    <button
                      className="btn btn-sm btn-outline-dark me-2"
                      onClick={() =>
                        downloadPDF(`http://localhost:5000/${p.file}`)
                      }
                    >
                      📄 Download PDF
                    </button>
                  )}

                  {role === "doctor" && (
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => openEditModal(p)}
                    >
                      ✏️ Edit Prescription
                    </button>
                  )}
                  <div>
{role === "admin" && p.patient?._id && (
  <Link
    to={`/admin/pharmacies/${p.patient._id}`}
    className="btn btn-sm btn-outline-info mt-2"
  >
    🏪 Nearby Pharmacies
  </Link>
)}
</div>

                  
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ✏️ Modal for Editing */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Prescription</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={editedNotes}
              onChange={(e) => setEditedNotes(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Medications (e.g., Paracetamol (500mg), Ibuprofen (200mg))</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={editedMedications}
              onChange={(e) => setEditedMedications(e.target.value)}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>🖋️ Upload New Signature (optional)</Form.Label>
            <Form.Control
              type="file"
              onChange={(e) => setSignature(e.target.files[0])}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdate}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ViewPrescriptions;
