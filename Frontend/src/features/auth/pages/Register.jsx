import React, { useState } from "react";
import "../auth.form.scss"
import { useNavigate, Link } from "react-router"

const BASE_URL = import.meta.env.VITE_API_URL || ""

const Register = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    fullname: "", username: "", email: "", password: "", otp: ""
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError("")
  }

  const handleSendOTP = async (e) => {
    e.preventDefault()
    if (!formData.fullname || !formData.username || !formData.email || !formData.password) {
      setError("Please fill all fields.")
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${BASE_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
        credentials: "include"
      })
      const data = await res.json()
      if (res.ok) setStep(2)
      else setError(data.message)
    } catch {
      setError("Something went wrong. Try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!formData.otp) { setError("Please enter OTP."); return }
    setLoading(true)
    try {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include"
      })
      const data = await res.json()
      if (res.ok) navigate("/login")
      else setError(data.message)
    } catch {
      setError("Something went wrong. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      <div className="form-container">
        <h1>Register</h1>
        {error && <p className="error-message">{error}</p>}

        {step === 1 && (
          <form onSubmit={handleSendOTP}>
            <div className="input-group">
              <label htmlFor="fullname">Full Name</label>
              <input type="text" id="fullname" name="fullname"
                placeholder="Enter full name" value={formData.fullname}
                onChange={handleChange} autoComplete="name" required />
            </div>
            <div className="input-group">
              <label htmlFor="username">Username</label>
              <input type="text" id="username" name="username"
                placeholder="Enter username" value={formData.username}
                onChange={handleChange} autoComplete="username" required />
            </div>
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email"
                placeholder="Enter email address" value={formData.email}
                onChange={handleChange} autoComplete="email" required />
            </div>
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password" name="password"
                  placeholder="Enter password" value={formData.password}
                  onChange={handleChange} autoComplete="new-password" required
                />
                <button type="button" className="toggle-password" onClick={() => setShowPassword(p => !p)}>
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <button className="button primary-button" disabled={loading}>
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleRegister}>
            <p className="otp-message">OTP sent to <span>{formData.email}</span></p>
            <div className="input-group">
              <label htmlFor="otp">OTP</label>
              <input type="text" id="otp" name="otp"
                placeholder="Enter OTP sent to your email" value={formData.otp}
                onChange={handleChange} autoComplete="one-time-code" required />
            </div>
            <button className="button primary-button" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>
            <button type="button" className="button back-button"
              onClick={() => { setStep(1); setError("") }}>
              Back
            </button>
          </form>
        )}

        <p className="bottom-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </main>
  )
}

export default Register;