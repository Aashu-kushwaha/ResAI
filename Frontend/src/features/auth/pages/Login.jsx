import React, { useState } from "react";
import "../auth.form.scss"
import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link } from "react-router";
import Loader from '../../../components/Loader'


const Login = () => {
  const { loading, handleLogin } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    const success = await handleLogin({ email, password })
    if (success) {
      navigate('/')
    } else {
      setError("Invalid email or password.")
    }
  }

  if (loading) return <Loader fullscreen text="Logging you in..." />

  return (
    <main>
      <div className="form-container">
        <h1>Login</h1>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              type="email" id="email" name="email"
              placeholder="Enter email address"
              autoComplete="email" required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="password-wrapper">
              <input
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                id="password" name="password"
                placeholder="Enter password"
                autoComplete="current-password" required
              />
              <button type="button" className="toggle-password" onClick={() => setShowPassword(p => !p)}>
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <div className="forgot-link">
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>
          <button className="button primary-button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="bottom-link">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </main>
  );
};

export default Login;