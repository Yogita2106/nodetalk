import React, { useState, useEffect } from "react";
import { sendOTP, verifyOTP, register, login, resendOTP } from "./api";
import { Mail, Lock, User, ShieldCheck, ArrowRight, RefreshCw } from "lucide-react";
import "./Auth.css";

const Auth = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Details
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", otp: "" });

  // Timer logic for Resend OTP
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await login({ email: formData.email, password: formData.password });
      localStorage.setItem("token", data.token);
      onLoginSuccess(data.user);
    } catch (err) {
      alert(err.response?.data?.message || "Login Failed");
    } finally { setLoading(false); }
  };

  const handleSendOTP = async () => {
    if (!formData.email) return alert("Email is required");
    setLoading(true);
    try {
      await sendOTP(formData.email);
      setStep(2);
      setTimer(60);
      alert("OTP Sent to " + formData.email);
    } catch (err) {
      // Is line ko change kar, taaki detail mile
      console.error("Backend Error Detail:", err.response?.data); 
      alert(err.response?.data?.message || "Error sending OTP");
    } finally { setLoading(false); }
};

  const handleResend = async () => {
    if (timer > 0) return;
    try {
      await resendOTP(formData.email);
      setTimer(60);
      alert("New OTP Sent!");
    } catch (err) { alert("Resend failed"); }
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    try {
      await verifyOTP(formData.email, formData.otp);
      setStep(3);
    } catch (err) {
      alert("Invalid OTP, please try again");
    } finally { setLoading(false); }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(formData);
      alert("Account Verified & Created! Please Login.");
      setIsLogin(true);
      setStep(1);
    } catch (err) {
      alert("Registration failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-glass-card">
        <div className="auth-header">
          <h1>NodeTalk</h1>
          <p>{isLogin ? "Welcome back, chat safely" : "Secure verification via OTP"}</p>
        </div>

        {isLogin ? (
          <form className="auth-form" onSubmit={handleLoginSubmit}>
            <div className="input-group">
              <Mail size={18} />
              <input name="email" type="email" placeholder="Email Address" onChange={handleChange} required />
            </div>
            <div className="input-group">
              <Lock size={18} />
              <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
            </div>
            <button type="submit" className="btn-gradient" disabled={loading}>
              {loading ? "Authenticating..." : "Sign In"}
            </button>
            <p className="toggle-link" onClick={() => setIsLogin(false)}>Don't have an account? <span>Register</span></p>
          </form>
        ) : (
          <div className="signup-flow">
            {step === 1 && (
              <div className="fade-in">
                <div className="input-group">
                  <Mail size={18} />
                  <input name="email" type="email" placeholder="Enter Email" onChange={handleChange} />
                </div>
                <button className="btn-gradient" onClick={handleSendOTP} disabled={loading}>
                  {loading ? "Sending..." : "Send Verification Code"}
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="fade-in">
                <div className="input-group">
                  <ShieldCheck size={18} />
                  <input name="otp" type="text" placeholder="6-Digit Code" maxLength="6" onChange={handleChange} />
                </div>
                <button className="btn-gradient" onClick={handleVerifyOTP} disabled={loading}>
                  Verify OTP
                </button>
                <button className="btn-resend" onClick={handleResend} disabled={timer > 0}>
                  {timer > 0 ? `Resend in ${timer}s` : "Resend Code"}
                </button>
              </div>
            )}

            {step === 3 && (
              <form className="fade-in" onSubmit={handleRegisterSubmit}>
                <div className="input-group">
                  <User size={18} />
                  <input name="name" type="text" placeholder="Full Name" onChange={handleChange} required />
                </div>
                <div className="input-group">
                  <Lock size={18} />
                  <input name="password" type="password" placeholder="Set Password" onChange={handleChange} required />
                </div>
                <button type="submit" className="btn-gradient">Finish & Create Account</button>
              </form>
            )}
            <p className="toggle-link" onClick={() => {setIsLogin(true); setStep(1);}}>Already verified? <span>Login</span></p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;