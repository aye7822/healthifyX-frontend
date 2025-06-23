import React, { useEffect, useState } from "react";
import axios from "../../services/api";

import { Card, Table, Badge, Button, Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";
import { FaUserMd, FaUser, FaCalendarAlt, FaCheck, FaTimes, FaTrash} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

function AdminDashboard() {
  const [doctors, setDoctors] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ patients: 0, doctors: 0, appointments: 0 });
  const [trends, setTrends] = useState([]);
  const [emailLogs, setEmailLogs] = useState([]);

  useEffect(() => {
    fetchDoctors();
    fetchUsers();
    fetchStats();
    fetchEmailLogs();
  }, []);

  const fetchDoctors = async () => {
    const res = await axios.get("/admin/doctors/pending", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    setDoctors(res.data);
  };

  const fetchUsers = async () => {
    const res = await axios.get("/admin/users", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    setUsers(res.data);
  };

  const fetchStats = async () => {
    const res = await axios.get("/admin/stats", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    setStats(res.data);
    setTrends(res.data.trends || []);
  };

  const fetchEmailLogs = async () => {
    const res = await axios.get("/admin/email-logs", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    setEmailLogs(res.data);
  };

  const handleApprove = async (id) => {
    await axios.put(`/admin/doctors/approve/${id}`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    fetchDoctors();
  };

  const handleReject = async (id) => {
    await axios.put(`/admin/doctors/reject/${id}`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    fetchDoctors();
  };

  const handleDelete = async (id) => {
    await axios.delete(`/admin/users/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    fetchUsers();
  };

  return (
    <motion.div className="container mt-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
      <h2 className="text-primary mb-4">🛠️ Admin Dashboard</h2>

      <Row className="mb-4 g-4">
        <Col md={4}>
          <Card className="text-center shadow border-0">
            <Card.Body>
              <FaUser size={30} className="text-secondary mb-2" />
              <Card.Title>Patients</Card.Title>
              <h3>{stats.patients}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center shadow border-0">
            <Card.Body>
              <FaUserMd size={30} className="text-info mb-2" />
              <Card.Title>Approved Doctors</Card.Title>
              <h3>{stats.doctors}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center shadow border-0">
            <Card.Body>
              <FaCalendarAlt size={30} className="text-success mb-2" />
              <Card.Title>Appointments</Card.Title>
              <h3>{stats.appointments}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="mb-4">
        <Card.Header className="bg-light fw-bold">📈 Appointment Trends (7 days)</Card.Header>
        <Card.Body>
          <ul className="list-group">
            {trends.map((t) => (
              <li className="list-group-item d-flex justify-content-between" key={t._id}>
                <span>{t._id}</span>
                <Badge bg="primary">{t.count}</Badge>
              </li>
            ))}
          </ul>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header className="bg-light fw-bold">👨‍⚕️ Pending Doctor Approvals</Card.Header>
        <Card.Body>
          {doctors.length === 0 ? (
            <div className="alert alert-success">No pending requests</div>
          ) : (
            doctors.map((doc) => (
              <motion.div key={doc._id} whileHover={{ scale: 1.02 }} className="mb-3 p-3 border rounded shadow-sm">
                <h5>{doc.name} <small className="text-muted">({doc.email})</small></h5>
                <p>Specialty: <strong>{doc.specialty}</strong><br />License #: {doc.licenseNumber}</p>
                <a href={`http://localhost:5000/${doc.licenseFile}`} target="_blank" rel="noreferrer">📄 View License</a>
                <div className="mt-2">
                  <Button variant="success" size="sm" className="me-2" onClick={() => handleApprove(doc._id)}><FaCheck /> Approve</Button>
                  <Button variant="danger" size="sm" onClick={() => handleReject(doc._id)}><FaTimes /> Reject</Button>
                </div>
              </motion.div>
            ))
          )}
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header className="bg-light fw-bold">👥 All Users</Card.Header>
        <Table striped bordered hover responsive className="mb-0">
          <thead>
            <tr>
              <th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td><Badge bg={u.role === "admin" ? "dark" : u.role === "doctor" ? "info" : "secondary"}>{u.role}</Badge></td>
                <td>{u.status || "-"}</td>
                <td>
                  <Button variant="outline-danger" size="sm" onClick={() => handleDelete(u._id)}><FaTrash /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Card className="mb-4">
        <Card.Header className="bg-light fw-bold">📬 Email Logs</Card.Header>
        <Table bordered size="sm">
          <thead>
            <tr>
              <th>To</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {emailLogs.map((log) => (
              <tr key={log._id}>
                <td>{log.to}</td>
                <td>{log.subject}</td>
                <td><Badge bg={log.status === "sent" ? "success" : "danger"}>{log.status}</Badge></td>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </motion.div>
  );
}

export default AdminDashboard;
