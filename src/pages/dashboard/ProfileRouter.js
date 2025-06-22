import PatientProfile from "../dashboard/PatientProfile";
import DoctorProfile from "../dashboard/DoctorProfile";
import AdminDashboard from "../admin/AdminDashboard";

function ProfileRouter() {
  const role = localStorage.getItem("role");

  if (role === "doctor") return <DoctorProfile />;
  if (role === "admin") return <AdminDashboard />;
  return <PatientProfile />;
}

export default ProfileRouter;
