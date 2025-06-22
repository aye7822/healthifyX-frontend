// client/src/pages/admin/AdminChart.js
import { useEffect, useState } from "react";
import axios from "../../services/api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid
} from "recharts";

import "bootstrap/dist/css/bootstrap.min.css";
import { Card } from "react-bootstrap";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

function AdminChart() {
  const [stats, setStats] = useState([]);
  const [summary, setSummary] = useState({
    appointments: 0,
    prescriptions: 0,
    records: 0,
    usersPerRole: { patient: 0, doctor: 0, admin: 0 }
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const [monthly, overview] = await Promise.all([
      axios.get("/admin/appointments/stats", { headers }),
      axios.get("/admin/stats", { headers })
    ]);

    const formatted = monthly.data.map((d) => ({
      month: d._id,
      appointments: d.count,
    }));

    setStats(formatted);
    setSummary({
      appointments: overview.data.appointments,
      prescriptions: overview.data.prescriptions,
      records: overview.data.records,
      usersPerRole: overview.data.usersPerRole
    });
  };

  const pieData = [
    { name: "Patients", value: summary.usersPerRole.patient },
    { name: "Doctors", value: summary.usersPerRole.doctor },
    { name: "Admins", value: summary.usersPerRole.admin },
  ];

  const barData = [
    {
      name: "System Usage",
      Prescriptions: summary.prescriptions,
      Records: summary.records,
      Appointments: summary.appointments,
    },
  ];

  return (
    <div className="container mt-4">
      <h3 className="text-primary mb-4">📊 System Analytics Dashboard</h3>
      <div className="row g-4">
        {/* Pie Chart */}
        <div className="col-md-4">
          <Card className="shadow-sm p-3">
            <h6 className="text-center">👥 Users by Role</h6>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={80} label>
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Bar Chart */}
        <div className="col-md-4">
          <Card className="shadow-sm p-3">
            <h6 className="text-center">📦 Record Summary</h6>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Prescriptions" fill="#007bff" />
                <Bar dataKey="Records" fill="#28a745" />
                <Bar dataKey="Appointments" fill="#ffc107" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Line Chart */}
        <div className="col-md-4">
          <Card className="shadow-sm p-3">
            <h6 className="text-center">📅 Appointment Trends</h6>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="appointments" stroke="#dc3545" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AdminChart;


