import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "../../services/api";
import "bootstrap/dist/css/bootstrap.min.css";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "patient",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" | "danger"
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/auth/register", form);

      const loginRes = await axios.post("/auth/login", {
        email: form.email,
        password: form.password,
      });

      localStorage.setItem("token", loginRes.data.token);
      setMessage("✅ Account created and logged in!");
      setMessageType("success");

      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.message || err.message));
      setMessageType("danger");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const userData = jwtDecode(credentialResponse.credential);
    try {
      await axios.post("/auth/google-register", {
        name: userData.name,
        email: userData.email,
        googleId: userData.sub,
      });

      setMessage("✅ Google registration successful!");
      setMessageType("success");
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setMessage("❌ Google signup failed: " + (err.response?.data?.message || err.message));
      setMessageType("danger");
    }
  };

  return (
    <div
      className="container-fluid d-flex align-items-center justify-content-start min-vh-100 px-4"
      style={{
        backgroundImage: `url("/assets/register.png")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        overflow: "hidden",
      }}
    >
      <div
        className="card shadow-lg  p-1 py-0"
        style={{
          maxWidth: 500,
          width: "100%",
        
          background: "rgba(255, 255, 255, 0.15)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          borderRadius: "20px",
          boxShadow: "0 0 40px rgba(0, 0, 0, 0.3)",
        }}
      >
        <div className="card-body">
          <h3 className="text-center mb-4 text-primary">📝 Create Your HealthifyX Account</h3>

          {message && (
            <div className={`alert alert-${messageType} text-center`} role="alert">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} autoComplete="on">
            <div className="mb-3">
              <label className="form-label">Full Name</label>
              <input
                name="name"
                className="form-control"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="example@gmail.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label d-flex justify-content-between">
                Password <span className="text-muted small">Min 6 characters</span>
              </label>
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  name="new-password"
                  autoComplete="new-password"
                  className="form-control"
                  placeholder="Create a strong password"
                  minLength={6}
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <span
                  className="input-group-text"
                  style={{ cursor: "pointer" }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              <div className="form-text">
                <button
                  type="button"
                  className="btn btn-sm btn-warning mt-2"
                  onClick={() =>
                    setForm({
                      ...form,
                      password: Math.random().toString(36).slice(-10) + "Aa1!",
                    })
                  }
                >
                  🔐 Suggest Strong Password
                </button>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Register As</label>
              <select
                className="form-select"
                name="role"
                value={form.role}
                onChange={handleChange}
              >
                <option value="patient">🧍 Patient</option>
                <option value="doctor">👨‍⚕️ Doctor</option>
                <option value="admin">👨‍💼 Admin</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary w-100 mb-3">
              🚀 Register
            </button>
          </form>

          <hr />
          <div className="text-center mb-2">Or sign up with</div>
          <div className="d-flex justify-content-center mb-3">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setMessage("❌ Google sign-in failed")}
              useOneTap
            />
          </div>

          <p className="text-center mt-3 text-muted" style={{ fontSize: "0.9rem" }}>
            Already have an account? <a href="/login">Login here</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
