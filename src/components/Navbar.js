import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../styles/main.css"; // Optional: if you want custom spacing

function Navbar({ onToggleSidebar, sidebarOpen }) {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setRole(null);
    navigate("/");
  };

  return (
    <nav
      className={`navbar navbar-expand-lg navbar-dark bg-primary shadow-sm px-3 fixed-top ${
        sidebarOpen ? "ps-5 ps-md-0" : ""
      }`}
      style={{ zIndex: 1050 }} // Keeps it above sidebar
    >
      <div className="container-fluid">
        {/* Sidebar Toggle */}
        <button
          className="btn btn-outline-light me-2"
          onClick={onToggleSidebar}
        >
          <i className="bi bi-list fs-5" />
        </button>

        {/* Logo */}
        <Link to="/" className="navbar-brand fw-bold">
          HealthifyX
        </Link>

        {/* Right Controls */}
        <div className="ms-auto d-flex align-items-center gap-2">
          {role ? (
            <button onClick={handleLogout} className="btn btn-light btn-sm">
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline-light btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-light btn-sm">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
