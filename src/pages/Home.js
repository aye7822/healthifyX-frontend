import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../services/api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Particles from "react-tsparticles";
import CountUp from "react-countup";
import { BsMoonStarsFill, BsSun, BsMic } from "react-icons/bs";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../styles/main.css";


function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [introVisible, setIntroVisible] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showWhyModal, setShowWhyModal] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [story, setStory] = useState("");
  const [testimonials, setTestimonials] = useState([]);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [showCommands, setShowCommands] = useState(false);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/api/testimonials").then((res) => setTestimonials(res.data || []));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIntroVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    window.$crisp = [];
    window.CRISP_WEBSITE_ID = "d00cabea-a6ac-4a65-b28d-343956003280";
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
    if (!SpeechRecognition) return alert("Web Speech API not supported in your browser.");
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
      else alert("Unrecognized command: " + command);
    };
    recognition.start();
  };

  const handleStorySubmit = async () => {
    if (!story.trim()) return;
    await axios.post("/api/testimonials", { message: story });
    setTestimonials([...testimonials, { message: story }]);
    setStory("");
    setShowStoryModal(false);
  };

  const defaultTestimonials = [
    { message: "HealthifyX streamlined my entire clinic workflow!" },
    { message: "Booking and prescriptions are super easy!" },
    { message: "Patient management is finally simple." },
    { message: "Fast, reliable and intuitive software." },
    { message: "A must-have for modern healthcare." },
  ];

  const combinedTestimonials = [...defaultTestimonials, ...testimonials];

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

 

      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="d-flex">
        <Sidebar isOpen={sidebarOpen} />
        <div className={`container-fluid py-5 px-5 ${sidebarOpen ? "with-sidebar" : ""}`}>
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
              🗣 Voice Commands: “Go to appointments”, “Go to prescriptions”, “Open admin panel”, “Go to records”
            </div>
          )}

          <div className={`text-center mb-5 ${introVisible ? "fade-in" : ""}`}>
            <h1 className="display-4 fw-bold text-primary">Welcome to HealthifyX</h1>
            <p className="lead text-muted">One platform for appointments, records & prescriptions.</p>
            <Link to="/register" className="btn btn-lg btn-primary shadow">🚀 Get Started</Link>
          </div>

          <div className="row text-center mb-5">
            {[
              { label: "Patients", value: 4500 },
              { label: "Doctors", value: 120 },
              { label: "Records", value: 9800 },
            ].map((item, i) => (
              <div className="col-md-4" key={i}>
                <h2 className="text-primary fw-bold"><CountUp end={item.value} duration={2.5} /></h2>
                <p className="text-muted">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="row g-4">
            {[
              { title: "Appointments", icon: "bi-calendar-check", link: "/book" },
              { title: "Records", icon: "bi-file-earmark-medical", link: "/records/add" },
              { title: "Prescriptions", icon: "bi-capsule", link: "/prescriptions" },
              { title: "Admin Panel", icon: "bi-speedometer2", link: "/admin" },
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
            {combinedTestimonials.length > 0 ? (
              <div className="carousel slide">
                <div className="carousel-inner">
                  {combinedTestimonials.map((item, idx) => (
                    <div className={`carousel-item ${carouselIndex === idx ? "active" : ""}`} key={idx}>
                      <p className="lead fst-italic">“{item.message}”</p>
                      <h6 className="text-muted">— User {idx + 1}</h6>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p>No testimonials yet.</p>
            )}
          </div>

          <div className="row text-center mt-5 gy-4">
            <div className="col-md-4">
              <h6 className="text-primary">Explore</h6>
              <ul className="list-unstyled small">
                <li><a href="#" onClick={(e) => { e.preventDefault(); setShowWhyModal(true); }}>Why HealthifyX?</a></li>
                <li><a href="#">Doctor App</a></li>
                <li><a href="#">Patient App</a></li>
                <li><a href="#">Blogs</a></li>
                <li><a href="#">Careers</a></li>
              </ul>
            </div>
            <div className="col-md-4">
              <h6 className="text-primary">Request Demo</h6>
              <a href="#" className="btn btn-outline-secondary btn-sm mt-2">Request Demo</a>
            </div>
            <div className="col-md-4">
              <h6 className="text-primary">Testimonials</h6>
              <p className="small text-muted fst-italic">"HealthifyX transformed our clinic. Easy, modern, and fast."</p>
              <button onClick={() => setShowStoryModal(true)} className="btn btn-link btn-sm">Share Your Story</button>
            </div>
          </div>

          <footer className="text-center mt-5 text-muted small">
            <hr />
            <p className="fw-bold">What is HealthifyX?</p>
            <p>HealthifyX is a digital health platform for managing appointments, records, prescriptions, and more — all in one intuitive dashboard for patients and doctors.</p>
            &copy; 2025 HealthifyX — Made for a better healthcare future.
          </footer>
        </div>
      </div>

      {/* Why Modal */}
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
                    HealthifyX empowers healthcare providers and patients with instant access to appointments, medical data, smart prescription handling, and AI-driven summaries — improving convenience, transparency, and outcomes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Story Modal */}
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
                    placeholder="Write your experience here..."
                    value={story}
                    onChange={(e) => setStory(e.target.value)}
                  />
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setShowStoryModal(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleStorySubmit}>Submit</button>
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
