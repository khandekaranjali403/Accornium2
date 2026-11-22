import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const initialFormData = {
  email: '',
  password: ''
};

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormData);
  const [status, setStatus] = useState({ state: 'idle', error: '' });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setStatus({ state: 'idle', error: '' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ state: 'loading', error: '' });
    try {
      await api.login(formData);
      await api.sendOtp({ email: formData.email, purpose: 'login' });
      setStatus({ state: 'success', error: '' });
      navigate('/verify-otp', { state: { email: formData.email } });
    } catch (error) {
      setStatus({ state: 'error', error: error.message });
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <span className="eyebrow">Welcome back</span>
        <h1>Log in to Accornium</h1>
        <p>Access your projects and continue where you left off.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </label>
          <button className="btn btn-primary" type="submit" disabled={status.state === 'loading'}>
            {status.state === 'loading' ? 'Signing in...' : 'Log In'}
          </button>
          {status.state === 'success' && <p className="form-success">You are signed in.</p>}
          {status.state === 'error' && <p className="form-error">Unable to sign in: {status.error}</p>}
        </form>

        <p className="auth-switch">
          New to Accornium? <Link to="/signup">Create an account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;