import { useEffect, useState, useRef } from "react";
import axios from "../../services/api";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Select from "react-select";
import "bootstrap/dist/css/bootstrap.min.css";

function AddPrescription() {
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({
    patientId: "",
    medications: "",
    notes: "",
    isDraft: false,
  });
  const [signature, setSignature] = useState(null);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const pdfRef = useRef();

  useEffect(() => {
    axios
      .get("/user/patients", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => {
        const formatted = res.data.map((p) => ({
          value: p._id,
          label: `${p.name} (${p.email})`,
        }));
        setPatients(formatted);
      })
      .catch((err) => console.error("Failed to load patients", err));
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handlePatientChange = (selected) => {
    setForm({ ...form, patientId: selected.value });
  };

  const handleGenerateAI = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        "/api/ai/medications",
        { notes: form.notes },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setAiSuggestion(res.data.suggestion || "");
    } catch {
      alert("⚠️ AI generation failed");
    }
    setLoading(false);
  };

  const generatePDF = async () => {
    const canvas = await html2canvas(pdfRef.current);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    pdf.addImage(imgData, "PNG", 10, 10, 190, 270);
    pdf.save("prescription.pdf");
  };

  const handleSubmit = async (e, draft = false) => {
    e.preventDefault();
    const data = new FormData();
    data.append("patientId", form.patientId);
    data.append("notes", form.notes);
    data.append("isDraft", draft);
    data.append("medications", aiSuggestion || form.medications);
    if (signature) data.append("signature", signature);
    if (!(form.medications || aiSuggestion)) {
  alert("⚠️ Please enter or generate medications first.");
  return;
}


    try {
      await axios.post("/prescriptions", data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert(draft ? "📝 Draft saved!" : "✅ Prescription sent!");
      navigate("/prescriptions");
    } catch (err) {
      console.error("Prescription error", err);
      alert("❌ Failed to send prescription");
    }
  };

  return (
    <div className="container mt-5">
      <h3 className="mb-4 text-primary">📝 Create Prescription</h3>
      <form onSubmit={(e) => handleSubmit(e, false)}>
        <div className="mb-3">
          <label className="form-label">Select Patient</label>
          <Select
            options={patients}
            onChange={handlePatientChange}
            placeholder="Search patient..."
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Notes</label>
          <textarea
            className="form-control"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={3}
            required
          ></textarea>
        </div>

        <div className="mb-3">
          <label className="form-label">💊 AI Suggested Medications</label>
          <div className="d-flex">
            <textarea
              className="form-control me-2"
              rows={3}
              value={aiSuggestion}
              onChange={(e) => setAiSuggestion(e.target.value)}
              placeholder="AI suggested meds will appear here..."
            ></textarea>
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={handleGenerateAI}
              disabled={loading}
            >
              {loading ? "Generating..." : "⚙️ AI Suggest"}
            </button>
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">🖋️ Signature</label>
          <input
            type="file"
            accept="image/*"
            className="form-control"
            onChange={(e) => setSignature(e.target.files[0])}
          />
        </div>

        <div className="d-flex justify-content-between">
          <button type="submit" className="btn btn-success">
            ✅ Send
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={(e) => handleSubmit(e, true)}
          >
            📝 Save as Draft
          </button>
          <button
            type="button"
            className="btn btn-outline-dark"
            onClick={generatePDF}
          >
            📄 Export PDF
          </button>
        </div>
      </form>

      <div className="mt-5 d-none" ref={pdfRef}>
        <h4>Prescription Preview</h4>
        <p>
          <strong>Patient:</strong>{" "}
          {
            patients.find((p) => p.value === form.patientId)?.label
          }
        </p>
        <p>
          <strong>Notes:</strong> {form.notes}
        </p>
        <p>
          <strong>Medications:</strong> {aiSuggestion || form.medications}
        </p>
        {signature && (
          <img
            src={URL.createObjectURL(signature)}
            alt="Signature"
            style={{ maxWidth: 150, marginTop: 10 }}
          />
        )}
      </div>
    </div>
  );
}

export default AddPrescription;
