// src/pages/Home.js
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Particles from "react-tsparticles";
import CountUp from "react-countup";
import { BsMoonStarsFill, BsSun, BsMic, BsRocketTakeoff } from "react-icons/bs";
import axios from "../services/api";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../styles/main.css";

function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [introVisible, setIntroVisible] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("dark") === "true");
  const [showWhyModal, setShowWhyModal] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [story, setStory] = useState("");
  const [testimonials, setTestimonials] = useState([]);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [showCommands, setShowCommands] = useState(false);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "HealthifyX — Your Healthcare Companion";
    document.body.className = darkMode ? "dark-mode" : "light-mode";
    localStorage.setItem("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    axios.get("/api/testimonials").then((res) => {
      const samples = [
        { message: "Booking was seamless, and the reminders helped me a lot!" },
        { message: "HealthifyX keeps all my records in one place—love it." },
        { message: "Super easy to share prescriptions with pharmacies!" },
        { message: "Made it easier for my doctor to track my health." },
        { message: "Simple and intuitive—great for families!" },
      ];
      const data = res.data || [];
      setTestimonials([...samples, ...data]);
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIntroVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    window.$crisp = [];
    window.CRISP_WEBSITE_ID = process.env.REACT_APP_CRISP_ID;
    const s = document.createElement("script");
    s.src = "https://client.crisp.chat/l.js";
    s.async = 1;
    document.body.appendChild(s);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % testimonials.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [testimonials]);

  const startVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Web Speech API not supported.");
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognitionRef.current = recognition;
    setShowCommands(true);

    recognition.onresult = (e) => {
      const command = e.results[0][0].transcript.toLowerCase();
      if (command.includes("appointment")) navigate("/book");
      else if (command.includes("record")) navigate("/records/add");
      else if (command.includes("prescription")) navigate("/prescriptions");
      else if (command.includes("admin")) navigate("/admin");
      else alert("❓ Unknown command: " + command);
    };
    recognition.start();
  };

  const handleStorySubmit = async () => {
    if (!story.trim()) return;
    await axios.post("/api/testimonials", { message: story });
    setTestimonials((prev) => [...prev, { message: story }]);
    setStory("");
    setShowStoryModal(false);
  };

  return (
    <div className={darkMode ? "dark-mode" : "light-mode"}>
      <Particles
        id="tsparticles"
        options={{
          fullScreen: { enable: true, zIndex: -1 },
          background: { color: darkMode ? "#1e1e1e" : "#f8f9fa" },
          particles: {
            number: { value: 50 },
            color: { value: darkMode ? "#00c3ff" : "#007bff" },
            opacity: { value: 0.2 },
            size: { value: 3 },
            move: { enable: true, speed: 0.6 },
          },
        }}
      />

      <Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        darkMode={darkMode}
        toggleDarkMode={() => setDarkMode(!darkMode)}
        sidebarOpen={sidebarOpen}
      />

      <div className="d-flex">
        <Sidebar isOpen={sidebarOpen} />

        <div className={`container-fluid py-5 px-4 ${sidebarOpen ? "with-sidebar" : ""}`}>
          <div className="d-flex justify-content-between mb-3">
            <button className="btn btn-outline-primary" onClick={startVoice}>
              <BsMic className="me-1" /> Speak
            </button>
            <button className="btn btn-outline-secondary" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <BsSun /> : <BsMoonStarsFill />}
            </button>
          </div>

          {showCommands && (
            <div className="alert alert-info small">
              🗣 Try: “Go to appointments”, “Open prescriptions”, “Go to records”, “Open admin panel”
            </div>
          )}

          <div className={`text-center mb-5 ${introVisible ? "fade-in" : ""}`}>
            <h1 className="display-4 fw-bold text-primary">Welcome to HealthifyX</h1>
            <p className="lead text-muted">
              HealthifyX is your smart healthcare assistant — manage appointments, access medical records,
              track prescriptions, and more — all in one place.
            </p>
            <Link to="/register" className="btn btn-lg btn-primary shadow">
              <BsRocketTakeoff className="me-2" /> Get Started
            </Link>
          </div>

          <div className="row text-center mb-5">
            {[
              { label: "Patients", value: 4500 },
              { label: "Doctors", value: 120 },
              { label: "Records", value: 9800 },
            ].map((item, i) => (
              <div className="col-md-4" key={i}>
                <h2 className="text-primary fw-bold">
                  <CountUp end={item.value} duration={2.5} />
                </h2>
                <p className="text-muted">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="row g-4">
            {[{ title: "Appointments", icon: "bi-calendar-check", link: "/book" },
              { title: "Records", icon: "bi-file-earmark-medical", link: "/records/add" },
              { title: "Prescriptions", icon: "bi-capsule", link: "/prescriptions" },
              { title: "Admin Panel", icon: "bi-speedometer2", link: "/admin" }
            ].map((f, i) => (
              <div className="col-md-6 col-lg-3" key={i}>
                <div className="card h-100 shadow-sm border-0 rounded-4">
                  <div className="card-body text-center">
                    <i className={`bi ${f.icon} display-5 text-primary mb-3`}></i>
                    <h5>{f.title}</h5>
                    <Link to={f.link} className="btn btn-outline-primary btn-sm">Learn More</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 text-center">
            <h4 className="text-primary mb-3">What People Say</h4>
            <div className="carousel slide">
              <div className="carousel-inner">
                {testimonials.map((item, idx) => (
                  <div className={`carousel-item ${carouselIndex === idx ? "active" : ""}`} key={idx}>
                    <p className="lead fst-italic">“{item.message}”</p>
                    <h6 className="text-muted">— User {idx + 1}</h6>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="row text-center mt-5 gy-4">
            <div className="col-md-4">
              <h6 className="text-primary">Explore</h6>
              <ul className="list-unstyled small">
                <li><a href="/" onClick={(e) => { e.preventDefault(); setShowWhyModal(true); }}>Why HealthifyX?</a></li>
                <li><a href="/">Doctor App</a></li>
                <li><a href="/">Patient App</a></li>
                <li><a href="/">Blogs</a></li>
                <li><a href="/">Careers</a></li>
              </ul>
            </div>
            <div className="col-md-4">
              <h6 className="text-primary">Request Demo</h6>
              <a href="/" className="btn btn-outline-secondary btn-sm mt-2">Request Demo</a>
            </div>
            <div className="col-md-4">
              <h6 className="text-primary">Testimonials</h6>
              <p className="small text-muted fst-italic">“HealthifyX transformed our clinic workflow.”</p>
              <button onClick={() => setShowStoryModal(true)} className="btn btn-link btn-sm">
                Share Your Story
              </button>
            </div>
          </div>

          <footer className="text-center mt-5 text-muted small">
            <hr />
            <h6>What is HealthifyX?</h6>
            <p>
              HealthifyX is a modern cloud platform empowering patients and healthcare providers to collaborate,
              track health history, and manage appointments easily.
            </p>
            &copy; {new Date().getFullYear()} HealthifyX — Built for better health.
          </footer>
        </div>
      </div>

      {/* Modals */}
      {showWhyModal && (
        <div className="modal-backdrop fade show">
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Why HealthifyX?</h5>
                  <button className="btn-close" onClick={() => setShowWhyModal(false)}></button>
                </div>
                <div className="modal-body">
                  <p>
                    HealthifyX bridges patients and doctors with intuitive appointment booking, record sharing, and
                    prescription management—all digitally streamlined.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showStoryModal && (
        <div className="modal-backdrop fade show">
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Share Your HealthifyX Story</h5>
                  <button className="btn-close" onClick={() => setShowStoryModal(false)}></button>
                </div>
                <div className="modal-body">
                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Write your story..."
                    value={story}
                    onChange={(e) => setStory(e.target.value)}
                  />
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setShowStoryModal(false)}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={handleStorySubmit}>
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
