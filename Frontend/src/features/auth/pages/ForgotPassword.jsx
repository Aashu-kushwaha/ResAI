import React, { useState } from "react";
import "../auth.form.scss"
import { useNavigate, Link } from "react-router"
import { forgotPasswordSendOTP, forgotPasswordReset } from "../services/auth.api"

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSendOTP = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await forgotPasswordSendOTP({ email })
      setStep(2)
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await forgotPasswordReset({ email, otp, newPassword })
      navigate("/login")
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      <div className="form-container">
        <h1>Forgot Password</h1>
        {error && <p className="error-message">{error}</p>}

        {step === 1 && (
          <form onSubmit={handleSendOTP}>
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                type="email" id="email" name="email"
                placeholder="Enter your registered email"
                value={email} onChange={(e) => setEmail(e.target.value)}
                autoComplete="email" required
              />
            </div>
            <button className="button primary-button" disabled={loading}>
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleReset}>
            <p className="otp-message">OTP sent to <span>{email}</span></p>
            <div className="input-group">
              <label htmlFor="otp">OTP</label>
              <input
                type="text" id="otp" name="otp"
                placeholder="Enter OTP" value={otp}
                onChange={(e) => setOtp(e.target.value)}
                autoComplete="one-time-code" required
              />
            </div>
            <div className="input-group">
              <label htmlFor="newPassword">New Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="newPassword" name="newPassword"
                  placeholder="Enter new password" value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password" required
                />
                <button type="button" className="toggle-password" onClick={() => setShowPassword(p => !p)}>
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <button className="button primary-button" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
            <button type="button" className="button back-button"
              onClick={() => { setStep(1); setError("") }}>
              Back
            </button>
          </form>
        )}

        <p className="bottom-link">
          Remember your password? <Link to="/login">Login</Link>
        </p>
      </div>
    </main>
  )
}

export default ForgotPassword;