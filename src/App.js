import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Auth
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Pages
import Home from "./pages/Home";
import ProfileRouter from "./pages/dashboard/ProfileRouter";
import BookAppointment from "./pages/appointments/BookAppointment";
import ViewAppointments from "./pages/appointments/ViewAppointments";
import DoctorAvailability from "./pages/dashboard/DoctorAvailability";
import PatientLocation from "./pages/dashboard/PatientLocation";

// Medical Records & Analytics
import AddMedicalRecord from "./pages/records/AddMedicalRecord";
import ViewMedicalRecords from "./pages/records/ViewMedicalRecords";
import PatientHealthAnalysis from "./pages/records/PatientHealthAnalysis";
import PatientAnalyticsForDoctor from "./pages/records/PatientAnalyticsForDoctor";

// Prescriptions
import AddPrescription from "./pages/prescriptions/AddPrescription";
import ViewPrescriptions from "./pages/prescriptions/ViewPrescriptions";
import PrescriptionAudit from "./pages/prescriptions/PrescriptionAudit";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminAppointments from "./pages/admin/AdminAppointments";
import AdminRecords from "./pages/admin/AdminRecords";
import AdminChart from "./pages/admin/AdminCharts";
import NearbyPharmacies from "./pages/admin/NearbyPharmacies";

// Auth wrapper
const PrivateRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Shared Profile Route */}
        <Route
          path="/profile"
          element={
            <PrivateRoute allowedRoles={["patient", "doctor"]}>
              <ProfileRouter />
            </PrivateRoute>
          }
        />

        {/* 👣 Location Setup */}
        <Route
          path="/set-location"
          element={
            <PrivateRoute allowedRoles={["patient"]}>
              <PatientLocation />
            </PrivateRoute>
          }
        />

        {/* Shared Appointments */}
        <Route
          path="/appointments"
          element={
            <PrivateRoute allowedRoles={["patient", "doctor"]}>
              <ViewAppointments />
            </PrivateRoute>
          }
        />

        {/* Shared Prescriptions */}
        <Route
          path="/prescriptions"
          element={
            <PrivateRoute allowedRoles={["patient", "doctor", "admin"]}>
              <ViewPrescriptions />
            </PrivateRoute>
          }
        />
        <Route
          path="/prescriptions/add"
          element={
            <PrivateRoute allowedRoles={["doctor"]}>
              <AddPrescription />
            </PrivateRoute>
          }
        />

        {/* Admin Prescription Audit */}
        <Route
          path="/admin/prescription-audit"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <PrescriptionAudit />
            </PrivateRoute>
          }
        />

        {/* Admin Nearby Pharmacies */}
        <Route
          path="/admin/pharmacies/:patientId"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <NearbyPharmacies />
            </PrivateRoute>
          }
        />

        {/* Patient-Only Routes */}
        <Route
          path="/book"
          element={
            <PrivateRoute allowedRoles={["patient"]}>
              <BookAppointment />
            </PrivateRoute>
          }
        />
        <Route
          path="/records/add"
          element={
            <PrivateRoute allowedRoles={["patient"]}>
              <AddMedicalRecord />
            </PrivateRoute>
          }
        />
        <Route
          path="/records/analyze"
          element={
            <PrivateRoute allowedRoles={["patient"]}>
              <PatientHealthAnalysis />
            </PrivateRoute>
          }
        />

        {/* Doctor-Only Routes */}
        <Route
          path="/availability"
          element={
            <PrivateRoute allowedRoles={["doctor"]}>
              <DoctorAvailability />
            </PrivateRoute>
          }
        />
        <Route
          path="/records/analytics/:id"
          element={
            <PrivateRoute allowedRoles={["doctor"]}>
              <PatientAnalyticsForDoctor />
            </PrivateRoute>
          }
        />

        {/* Shared Record View */}
        <Route
          path="/records"
          element={
            <PrivateRoute allowedRoles={["patient", "doctor"]}>
              <ViewMedicalRecords />
            </PrivateRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/appointments"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <AdminAppointments />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/records"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <AdminRecords />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/stats"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <AdminChart />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
