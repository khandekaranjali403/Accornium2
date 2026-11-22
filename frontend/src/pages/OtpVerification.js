import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

function OtpVerification() {
  const location = useLocation();
  const navigate = useNavigate();
  const inputRefs = useRef([]);
  const email = location.state?.email || 'your registered email';
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  useEffect(() => {
    if (secondsLeft === 0) return undefined;
    const timer = window.setInterval(() => {
      setSecondsLeft((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [secondsLeft]);

  const handleChange = (index, event) => {
    const value = event.target.value.replace(/\D/g, '').slice(-1);
    const nextOtp = [...otp];
    nextOtp[index] = value;
    setOtp(nextOtp);
    setStatus({ state: 'idle', message: '' });
    if (value && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const values = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH).split('');
    if (!values.length) return;
    setOtp([...values, ...Array(OTP_LENGTH - values.length).fill('')]);
    inputRefs.current[Math.min(values.length, OTP_LENGTH) - 1]?.focus();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const code = otp.join('');
    if (code.length !== OTP_LENGTH) {
      setStatus({ state: 'error', message: 'Enter the complete 6-digit code.' });
      return;
    }

    setStatus({ state: 'loading', message: '' });
    try {
      await api.verifyOtp({ email, otp: code });
      setStatus({ state: 'success', message: 'Your email has been verified.' });
      window.setTimeout(() => navigate('/dashboard'), 700);
    } catch (error) {
      setStatus({ state: 'error', message: error.message });
    }
  };

  const handleResend = async () => {
    if (secondsLeft > 0) return;
    setStatus({ state: 'loading', message: '' });
    try {
      await api.sendOtp({ email, purpose: 'verification' });
      setSecondsLeft(RESEND_SECONDS);
      setOtp(Array(OTP_LENGTH).fill(''));
      setStatus({ state: 'success', message: 'A new verification code was sent.' });
      inputRefs.current[0]?.focus();
    } catch (error) {
      setStatus({ state: 'error', message: error.message });
    }
  };

  return (
    <main className="otp-page">
      <section className="otp-brand-panel">
        <div className="bank-brand"><span className="bank-mark">+</span> FinBank</div>
        <p>Banking for a better tomorrow</p>
        <div className="bank-building" aria-hidden="true">
          <span /><span /><span /><span /><span />
        </div>
        <div className="bank-promise">
          <strong>Secure. Simple. Smart.</strong>
          <small>Your trusted banking partner.</small>
        </div>
      </section>

      <section className="otp-card" aria-labelledby="otp-title">
        <div className="otp-content">
          <span className="otp-icon" aria-hidden="true">✓</span>
          <h1 id="otp-title">Verify OTP</h1>
          <p>We have sent a 6-digit OTP to<br /><strong>{email}</strong></p>

          <form onSubmit={handleSubmit}>
            <div className="otp-inputs" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => { inputRefs.current[index] = element; }}
                  className="otp-input"
                  inputMode="numeric"
                  maxLength="1"
                  aria-label={`OTP digit ${index + 1}`}
                  value={digit}
                  onChange={(event) => handleChange(index, event)}
                  onKeyDown={(event) => handleKeyDown(index, event)}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <p className="otp-timer">
              {secondsLeft > 0 ? <>Resend OTP in <strong>00:{String(secondsLeft).padStart(2, '0')}</strong></> : 'You can request a new code now.'}
            </p>
            <button className="btn btn-primary otp-submit" type="submit" disabled={status.state === 'loading'}>
              {status.state === 'loading' ? 'Verifying...' : 'Verify'}
            </button>
            {status.message && <p className={status.state === 'error' ? 'form-error' : 'form-success'}>{status.message}</p>}
          </form>

          <button className="otp-resend" type="button" onClick={handleResend} disabled={secondsLeft > 0 || status.state === 'loading'}>
            Resend OTP
          </button>
          <Link className="otp-back" to="/login">Back to Login</Link>
        </div>
      </section>
    </main>
  );
}

export default OtpVerification;
