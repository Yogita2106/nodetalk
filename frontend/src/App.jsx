import React, { useState } from "react";
import Chat from "./Chat";
import API from "./api";
import "./App.css"; // CSS hum niche likhenge

export default function App() {
  const [auth, setAuth] = useState(!!localStorage.getItem("token"));
  const [view, setView] = useState("landing"); // 'landing', 'login', 'register'
  const [form, setForm] = useState({ name: "", email: "", password: "", username: "" });

  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = view === "login" ? "/auth/login" : "/auth/register";
    try {
      const res = await API.post(endpoint, form);
      if (view === "login") {
        localStorage.setItem("token", res.data.token);
        setAuth(true);
      } else {
        alert("Account Created! Please Login.");
        setView("login");
      }
    } catch (err) { alert(err.response?.data?.message || "Error"); }
  };

  if (auth) return <Chat />;

  // Landing Page View
  if (view === "landing") {
    return (
      <div className="landing-container">
        <div className="hero-section">
          <h1 className="logo-text">Node-Talk</h1>
          <p className="hero-sub">Secure. Private. Real-time.</p>
          <div className="btn-group">
            <button className="btn-primary" onClick={() => setView("login")}>Login</button>
            <button className="btn-secondary" onClick={() => setView("register")}>Start Now</button>
          </div>
        </div>
      </div>
    );
  }

  // Auth Form View (Login/Register)
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{view === "login" ? "Welcome Back" : "Create Account"}</h2>
        <form onSubmit={handleAuth}>
          {view === "register" && (
            <>
              <input placeholder="Full Name" required onChange={(e) => setForm({...form, name: e.target.value})} />
              <input placeholder="Choose Unique Username" required onChange={(e) => setForm({...form, username: e.target.value})} />
            </>
          )}
          <input type="email" placeholder="Email Address" required onChange={(e) => setForm({...form, email: e.target.value})} />
          <input type="password" placeholder="Password" required onChange={(e) => setForm({...form, password: e.target.value})} />
          <button type="submit" className="btn-submit">
            {view === "login" ? "Login" : "Register"}
          </button>
        </form>
        <p className="toggle-text" onClick={() => setView(view === "login" ? "register" : "login")}>
          {view === "login" ? "New to Node-Talk? Join now" : "Already have an account? Sign In"}
        </p>
      </div>
    </div>
  );
}