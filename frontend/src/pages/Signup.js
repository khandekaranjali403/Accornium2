import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const initialFormData = {
  name: '',
  email: '',
  password: ''
};

function Signup() {
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
	const name = formData.name.trim();
	const email = formData.email.trim().toLowerCase();
	if (!name || !email || formData.password.length < 8) {
	  setStatus({ state: 'error', error: 'Enter your name and email, and use a password with at least 8 characters.' });
	  return;
	}

    setStatus({ state: 'loading', error: '' });
    try {
      await api.signup({ name, email, password: formData.password });
      await api.sendOtp({ email, purpose: 'signup' });
      setStatus({ state: 'success', error: '' });
      navigate('/verify-otp', { state: { email } });
    } catch (error) {
      setStatus({ state: 'error', error: error.message });
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <span className="eyebrow">Get started</span>
        <h1>Create your account</h1>
        <p>Join Accornium and keep your software projects moving forward.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Name
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              autoComplete="name"
              required
            />
          </label>
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
              autoComplete="new-password"
              minLength="8"
              required
            />
          </label>
          <button className="btn btn-primary" type="submit" disabled={status.state === 'loading'}>
            {status.state === 'loading' ? 'Creating account...' : 'Sign Up'}
          </button>
          {status.state === 'success' && <p className="form-success">Your account was created.</p>}
          {status.state === 'error' && <p className="form-error">Unable to create account: {status.error}</p>}
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;