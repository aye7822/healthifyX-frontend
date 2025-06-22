import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { FaEye, FaEyeSlash, FaKey } from "react-icons/fa";
import axios from "../../services/api";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/auth/login", form);
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("userId", user._id);

      setMessage("✅ Login successful!");
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setMessage("❌ Login failed: " + (err.response?.data?.message || err.message));
    }
  };

  const handleReset = async () => {
    try {
      await axios.post("/auth/forgot-password", { email: resetEmail });
      setMessage("📧 Reset link sent to your email.");
      setShowReset(false);
    } catch (err) {
      setMessage("❌ Failed to send reset link.");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const userData = jwtDecode(credentialResponse.credential);
    try {
      const res = await axios.post("/auth/google-register", {
        name: userData.name,
        email: userData.email,
        googleId: userData.sub,
      });

      const { token } = res.data;
      localStorage.setItem("token", token);
      setMessage("✅ Google login successful!");
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      setMessage("❌ Google login failed");
    }
  };
<style>
{`
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes subtlePulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.015); }
    100% { transform: scale(1); }
  }

  .animated-card {
    animation: fadeInUp 0.8s ease-out, subtlePulse 3s ease-in-out infinite;
  }
`}
</style>

  return (
    <div
  className="container-fluid d-flex align-items-end justify-content-center min-vh-100 px-3"
  style={{
    backgroundImage: `url("/assets/login.png")`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    paddingBottom: "5vh",
  }}
>
 <div
  className="card animated-card shadow-lg p-2 py-0"
  style={{
    maxWidth: 350,
    width: "100%",
    background: "rgba(255, 255, 255, 0.12)",
    borderRadius: "16px",
    backdropFilter: "blur(14px)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.25)",
    color: "#fff",
  }}
>


        <div className="card-body">
          <h3 className="text-center mb-4 text-primary">🔑 Log in to HealthifyX</h3>

          {message && <div className="alert alert-info text-center py-2">{message}</div>}

          {!showReset ? (
            <>
              <form onSubmit={handleSubmit} autoComplete="on">
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    className="form-control"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <div className="input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      autoComplete="current-password"
                      className="form-control"
                      placeholder="••••••••"
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
                </div>

                <button type="submit" className="btn btn-primary w-100 mb-3">
                  🚀 Log In
                </button>
              </form>

              <hr />
              <div className="text-center mb-2">or sign in with</div>

              <div className="d-flex justify-content-center mb-3">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setMessage("❌ Google sign-in failed")}
                  useOneTap
                />
              </div>

              <div className="d-flex justify-content-between small">
                <button
                  className="btn btn-link text-decoration-none"
                  onClick={() => setShowReset(true)}
                >
                  Forgot password?
                </button>
                <button
                  className="btn btn-link text-decoration-none"
                  onClick={() => navigate("/register")}
                >
                  New user? Register
                </button>
              </div>
            </>
          ) : (
            <>
              <h6 className="text-muted mb-3">🔁 Reset Your Password</h6>
              <div className="mb-3">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter your registered email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                />
              </div>
              <button className="btn btn-primary w-100 mb-2" onClick={handleReset}>
                <FaKey className="me-1" /> Send Reset Link
              </button>
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => setShowReset(false)}
              >
                Back to Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
