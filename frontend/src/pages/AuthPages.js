import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './AuthPages.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

async function authRequest(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  } catch (error) {
    throw new Error(`FinBank could not be reached. Check your connection and try again. (${error.message})`);
  }

  const responseText = await response.text();
  let data = {};
  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch (error) {
      data = { message: responseText };
    }
  }
  if (!response.ok) {
    throw new Error(data.message || data.error || `Request failed (${response.status}). Please try again.`);
  }
  return data;
}

function ThemeButton({ darkMode, onToggleTheme }) {
  return (
    <button
      className="auth-theme-toggle"
      type="button"
      onClick={onToggleTheme}
      aria-label="Toggle dark mode"
      aria-pressed={darkMode}
      title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
    >
      <span aria-hidden="true">{darkMode ? '☀' : '☾'}</span>
      <span>{darkMode ? 'Light mode' : 'Dark mode'}</span>
    </button>
  );
}

function AuthFrame({ children, darkMode, onToggleTheme, subtitle }) {
  return (
    <div className="auth-page">
      <div className="auth-topbar">
        <Link className="auth-brand" to="/" aria-label="FinBank home">
          <span className="auth-brand-mark" aria-hidden="true">f</span>
          <span>finbank</span>
        </Link>
        <ThemeButton darkMode={darkMode} onToggleTheme={onToggleTheme} />
      </div>
      <div className="auth-layout">
        <aside className="auth-showcase">
          <div className="showcase-content">
            <span className="showcase-label"><span /> BANKING, MADE HUMAN</span>
            <h1>Your money.<br />Moving forward.</h1>
            <p>Feel good about your finances with secure, simple banking that puts you in control.</p>
            <div className="showcase-card" aria-label="Example account balance">
              <div className="showcase-card-top">
                <span className="mini-brand"><span className="auth-brand-mark">f</span> finbank</span>
                <span className="card-chip" aria-hidden="true">▦</span>
              </div>
              <span className="balance-label">TOTAL BALANCE</span>
              <strong>$24,680<span>.50</span></strong>
              <div className="card-bottom">
                <span>•••• &nbsp; •••• &nbsp; •••• &nbsp; 4829</span>
                <span>VISA</span>
              </div>
            </div>
            <div className="trust-note"><span aria-hidden="true">✓</span> Your security is always our priority</div>
          </div>
          <div className="showcase-orb showcase-orb-one" />
          <div className="showcase-orb showcase-orb-two" />
        </aside>
        <section className="auth-panel">
          <div className="auth-card">
            <span className="auth-mobile-kicker">FINBANK DIGITAL BANKING</span>
            <h2>{subtitle}</h2>
            {children}
          </div>
          <p className="auth-legal">Protected by 256-bit encryption <span>·</span> Member FDIC</p>
        </section>
      </div>
    </div>
  );
}

function SignupForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const result = await authRequest('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      if (!result.token) {
        throw new Error('The server did not return a sign-in token. Please try again.');
      }
      window.sessionStorage.setItem('finbank-token', result.token);
      window.sessionStorage.setItem('finbank-user-name', result.name || '');
      window.sessionStorage.setItem('finbank-user-email', result.email || '');
      navigate('/finbank', { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={submit}>
      <p className="auth-intro">Create your account and get started in just a few steps.</p>
      {error && <p className="auth-message auth-message-error" role="alert">{error}</p>}
      <label>
        Full name
        <input name="name" type="text" autoComplete="name" placeholder="e.g. Jordan Lee" value={form.name} onChange={update} required />
      </label>
      <label>
        Email address
        <input name="email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={update} required />
      </label>
      <label>
        Password
        <input name="password" type="password" autoComplete="new-password" placeholder="At least 8 characters" minLength="8" value={form.password} onChange={update} required />
        <span className="field-hint">Use at least 8 characters.</span>
      </label>
      <button className="auth-submit" type="submit" disabled={busy}>
        {busy ? 'Creating your account…' : 'Create account'} <span aria-hidden="true">→</span>
      </button>
      <p className="auth-switch">Already have an account? <Link to="/login">Log in</Link></p>
    </form>
  );
}

function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: location.state?.email || '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(
    location.state?.registered
      ? 'Your account has been created. Please log in.'
      : location.state?.verified
        ? 'Your email is verified. You can now log in.'
        : '',
  );
  const [busy, setBusy] = useState(false);
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setBusy(true);
    try {
      const result = await authRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      if (!result.token) {
        throw new Error('The server did not return a sign-in token. Please try again.');
      }
      window.sessionStorage.setItem('finbank-token', result.token);
      window.sessionStorage.setItem('finbank-user-name', result.name || '');
      window.sessionStorage.setItem('finbank-user-email', result.email || '');
      navigate('/finbank', { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const sendLoginCode = async () => {
    setError('');
    setSuccess('');
    if (!form.email) {
      setError('Enter your email address first so we know where to send your code.');
      return;
    }
    setBusy(true);
    try {
      await authRequest('/api/auth/send-login-otp', {
        method: 'POST',
        body: JSON.stringify({ email: form.email, purpose: 'LOGIN' }),
      });
      navigate('/verify-email', { state: { email: form.email, purpose: 'LOGIN' } });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={submit}>
      <p className="auth-intro">Welcome back. Enter your details to access your account.</p>
      {error && <p className="auth-message auth-message-error" role="alert">{error}</p>}
      {success && <p className="auth-message auth-message-success" role="status">{success}</p>}
      <label>
        Email address
        <input name="email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={update} required />
      </label>
      <label>
        Password
        <input name="password" type="password" autoComplete="current-password" placeholder="Enter your password" value={form.password} onChange={update} required />
      </label>
      <button className="auth-submit" type="submit" disabled={busy}>
        {busy ? 'Signing in…' : 'Log in'} <span aria-hidden="true">→</span>
      </button>
      <div className="auth-divider"><span>OR</span></div>
      <button className="auth-secondary" type="button" onClick={sendLoginCode} disabled={busy}>Continue with email code</button>
      <p className="auth-switch">New to FinBank? <Link to="/signup">Create an account</Link></p>
    </form>
  );
}

function VerifyEmailForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';
  const purpose = location.state?.purpose || 'SIGNUP';
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  const verify = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setBusy(true);
    try {
      const path = purpose === 'SIGNUP'
        ? '/api/auth/verify-otp?purpose=SIGNUP'
        : '/api/auth/verify-otp';
      const result = await authRequest(path, {
        method: 'POST',
        body: JSON.stringify({ email, otp, purpose }),
      });
      if (!result.token) {
        throw new Error('The server did not return a sign-in token. Please try again.');
      }
      window.sessionStorage.setItem('finbank-token', result.token);
      window.sessionStorage.setItem('finbank-user-name', result.name || '');
      window.sessionStorage.setItem('finbank-user-email', result.email || '');
      navigate('/finbank', { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setError('');
    setSuccess('');
    setBusy(true);
    try {
      await authRequest('/api/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ email, purpose }),
      });
      setSuccess(`A new verification code was sent to ${email}.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  if (!email) {
    return (
      <div className="auth-form">
        <p className="auth-intro">To verify your email, start by creating an account or signing in with an email code.</p>
        <Link className="auth-submit auth-submit-link" to="/signup">Create an account <span aria-hidden="true">→</span></Link>
        <p className="auth-switch">Already a customer? <Link to="/login">Log in</Link></p>
      </div>
    );
  }

  return (
    <form className="auth-form" onSubmit={verify}>
      <div className="otp-icon" aria-hidden="true">✉</div>
      <p className="auth-intro">We sent a 6-digit verification code to <strong>{email}</strong>. Enter it below to continue.</p>
      {error && <p className="auth-message auth-message-error" role="alert">{error}</p>}
      {success && <p className="auth-message auth-message-success" role="status">{success}</p>}
      <label>
        Verification code
        <input className="otp-input" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength="6" placeholder="000000" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} required aria-label="6-digit verification code" />
      </label>
      <button className="auth-submit" type="submit" disabled={busy || otp.length !== 6}>
        {busy ? 'Verifying…' : 'Verify email'} <span aria-hidden="true">→</span>
      </button>
      <p className="resend-code">Didn't receive the email? <button type="button" onClick={resend} disabled={busy}>Resend code</button></p>
      <p className="auth-switch"><Link to={purpose === 'SIGNUP' ? '/signup' : '/login'}>← Back</Link></p>
    </form>
  );
}

function LoggedOutPage() {
  return (
    <div className="auth-form">
      <div className="otp-icon" aria-hidden="true">✓</div>
      <p className="auth-intro">You have been securely signed out of your FinBank account.</p>
      <Link className="auth-submit auth-submit-link" to="/login">Sign in again <span aria-hidden="true">→</span></Link>
      <p className="auth-switch"><Link to="/">Return to home</Link></p>
    </div>
  );
}

function AuthPages({ page, darkMode, onToggleTheme }) {
  const titles = {
    signup: 'Create your account',
    login: 'Welcome back',
    verify: 'Verify your email',
    'logged-out': 'You’re signed out',
  };
  return (
    <AuthFrame subtitle={titles[page]} darkMode={darkMode} onToggleTheme={onToggleTheme}>
      {page === 'signup' && <SignupForm />}
      {page === 'login' && <LoginForm />}
      {page === 'verify' && <VerifyEmailForm />}
      {page === 'logged-out' && <LoggedOutPage />}
    </AuthFrame>
  );
}

export default AuthPages;
