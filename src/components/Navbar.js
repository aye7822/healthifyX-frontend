import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

function Navbar({ onToggleSidebar }) {
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
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm px-3">
      <div className="container-fluid">
        <button className="btn btn-outline-light me-2" onClick={onToggleSidebar}>
          ☰
        </button>
        <Link className="navbar-brand fw-bold" to="/">
          HealthifyX
        </Link>

        <div className="ms-auto d-flex align-items-center gap-2">
          {role ? (
            <>
              
              <button onClick={handleLogout} className="btn btn-light btn-sm">
                Logout
              </button>
            </>
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
