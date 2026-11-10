import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus('');
    setLoading(true);

    try {
      const response = await api.post('/contact', form);
      setStatus(response.data.message || 'Your message has been sent!');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setStatus(error.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="contact-page">
      <header className="contact-header">
        <Link className="brand" to="/" aria-label="Saanjha home">
          <span className="brand-mark">S</span>
          <span className="brand-name">saanjha</span>
        </Link>
        <Link className="contact-back-link" to="/">Back to home</Link>
      </header>

      <section className="contact-content">
        <div className="contact-intro">
          <span className="contact-eyebrow">WE'RE HERE TO HELP</span>
          <h1>Let's talk<span>.</span></h1>
          <p>Have a question, an idea, or feedback to share? We'd love to hear from you.</p>
          <div className="contact-note">
            <span className="contact-note-icon">?</span>
            <div>
              <strong>Every thought matters.</strong>
              <p>Your suggestions help make our campus community better.</p>
            </div>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <h2>Send us a message</h2>
          <p className="contact-form-subtitle">Fill in the details below and we'll receive your message.</p>

          <label htmlFor="contact-name">Your name</label>
          <input id="contact-name" name="name" value={form.name} onChange={handleChange} placeholder="Enter your name" maxLength="80" required />

          <label htmlFor="contact-email">Email address</label>
          <input id="contact-email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" maxLength="254" required />

          <label htmlFor="contact-subject">Subject</label>
          <select id="contact-subject" name="subject" value={form.subject} onChange={handleChange} required>
            <option value="" disabled>Select a topic</option>
            <option value="General question">General question</option>
            <option value="Feedback">Feedback</option>
            <option value="Suggestion">Suggestion</option>
            <option value="Report an issue">Report an issue</option>
            <option value="Other">Other</option>
          </select>

          <label htmlFor="contact-message">Your message</label>
          <textarea id="contact-message" name="message" value={form.message} onChange={handleChange} placeholder="Tell us what's on your mind..." rows="5" maxLength="3000" required />

          {status && <p className="contact-status" role="status">{status}</p>}

          <button className="contact-submit" type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send message ?'}
          </button>
        </form>
      </section>

      <footer className="contact-footer">Made with care for a campus that shares. <span>?</span></footer>
    </main>
  );
}
