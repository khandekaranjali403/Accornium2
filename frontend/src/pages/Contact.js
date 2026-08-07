import React, { useState } from 'react';
import SectionHeading from '../components/SectionHeading';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

const initialState = { name: '', email: '', phone: '', subject: '', message: '' };

function Contact() {
  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState({ state: 'idle', error: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ state: 'loading', error: '' });
    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to send message');
      setStatus({ state: 'success', error: '' });
      setForm(initialState);
    } catch (err) {
      setStatus({ state: 'error', error: err.message });
    }
  };

  return (
    <div className="container section">
      <SectionHeading
        eyebrow="Contact Us"
        title="Let's build something great together"
        subtitle="Tell us about your project and we'll get back to you within one business day."
      />

      <div className="contact-grid">
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>
              Name
              <input name="name" value={form.name} onChange={handleChange} required />
            </label>
            <label>
              Email
              <input type="email" name="email" value={form.email} onChange={handleChange} required />
            </label>
          </div>
          <div className="form-row">
            <label>
              Phone
              <input name="phone" value={form.phone} onChange={handleChange} />
            </label>
            <label>
              Subject
              <input name="subject" value={form.subject} onChange={handleChange} required />
            </label>
          </div>
          <label>
            Message
            <textarea name="message" rows="5" value={form.message} onChange={handleChange} required />
          </label>

          <button className="btn btn-primary" type="submit" disabled={status.state === 'loading'}>
            {status.state === 'loading' ? 'Sending...' : 'Send Message'}
          </button>

          {status.state === 'success' && (
            <p className="form-success">Thanks! Your message has been sent.</p>
          )}
          {status.state === 'error' && (
            <p className="form-error">Something went wrong: {status.error}</p>
          )}
        </form>

        <div className="contact-info">
          <h3>Get in touch</h3>
          <p>Email: hello@accornium.com</p>
          <p>Phone: +1 (555) 010-2030</p>
          <p>Address: 123 Innovation Drive, Tech Park, Bengaluru, India</p>
        </div>
      </div>
    </div>
  );
}

export default Contact;
