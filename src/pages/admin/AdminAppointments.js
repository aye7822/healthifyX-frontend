import { useEffect, useState } from "react";
import axios from "../../services/api";
import { Container, Card, Row, Col, Button, Badge, Spinner, OverlayTrigger, Tooltip } from "react-bootstrap";
import { motion } from "framer-motion";

function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/admin/appointments", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setAppointments(res.data);
    } catch (err) {
      console.error("Failed to fetch appointments", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this appointment?")) return;
    await axios.delete(`/admin/appointments/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    fetchAppointments();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed": return "success";
      case "pending": return "secondary";
      case "cancelled": return "danger";
      default: return "info";
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="text-primary mb-4 text-center">🗂️ Manage All Appointments</h2>

      {loading ? (
        <div className="text-center mt-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : appointments.length === 0 ? (
        <div className="alert alert-info">No appointments found.</div>
      ) : (
        <Row xs={1} md={2} lg={2} className="g-4">
          {appointments.map((a, idx) => (
            <Col key={a._id}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="shadow-sm h-100">
                  <Card.Body>
                    <Card.Title className="text-dark">
                      👤 {a.patient?.name || "Unknown"} <span className="text-muted">→</span> 🩺 {a.doctor?.name || "Unknown"}
                    </Card.Title>

                    <Card.Subtitle className="mb-2 text-muted">
                      📅 {new Date(a.date).toLocaleString()}
                    </Card.Subtitle>

                    <p className="mb-1">
                      <Badge bg={getStatusColor(a.status)}>{a.status?.toUpperCase()}</Badge>
                    </p>

                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip>Remove appointment</Tooltip>}
                    >
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(a._id)}
                      >
                        🗑 Delete
                      </Button>
                    </OverlayTrigger>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}

export default AdminAppointments;
