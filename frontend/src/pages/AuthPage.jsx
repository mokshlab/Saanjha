
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api, { saveSession } from '../api';

function AuthPage({ mode }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [college, setCollege] = useState('');
  const [studentId, setStudentId] = useState('');
  const [otp, setOtp] = useState('');
  const [otpMessage, setOtpMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isRegister = mode === 'register';
  const isOtp = mode === 'otp';
  const registeredEmail = location.state?.email || '';

  async function handleSubmit(event) {
    event.preventDefault();
    setOtpMessage('');
    setSubmitting(true);

    try {
      if (isRegister) {
        const response = await api.post('/auth/register', {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          college: college.trim(),
          studentId: studentId.trim() || undefined,
        });
        navigate('/verify-otp', {
          state: { email: response.data.email },
        });
      } else if (isOtp) {
        const response = await api.post('/auth/verify-otp', {
          email: registeredEmail,
          code: otp,
        });
        saveSession(response.data);
        navigate(location.state?.from || '/');
      } else {
        const response = await api.post('/auth/login', {
          email: email.trim().toLowerCase(),
          password,
        });
        if (response.data.otpRequired) {
          navigate('/verify-otp', { state: { email: response.data.email } });
        } else {
          saveSession(response.data);
          navigate('/');
        }
      }
    } catch (error) {
      setOtpMessage(error.response?.data?.message || 'Could not complete this request.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleResend() {
    navigate('/login', { state: { email: registeredEmail } });
  }

  return (
    <main className="auth-page">
      <Link to="/" className="auth-brand">
        saanjha<span>.</span>
      </Link>

      <section className="auth-card">
        <div className="auth-illustration" aria-hidden="true">
          <span className="auth-emoji">
            {isOtp ? '✉️' : isRegister ? '🌱' : '👋'}
          </span>
          <div className="auth-decoration">♡</div>
        </div>

        <p className="auth-eyebrow">
          YOUR CAMPUS, YOUR COMMUNITY
        </p>

        <h1>
          {isOtp
            ? 'Verify your email'
            : isRegister
              ? 'Join Saanjha!'
              : 'Welcome back!'}
        </h1>

        <p className="auth-description">
          {isOtp
            ? 'Enter the code sent to your campus email.'
            : isRegister
              ? 'Give your pre-loved things a new home.'
              : 'Your campus community is waiting for you.'}
        </p>

        {isOtp && registeredEmail && (
          <p className="auth-description">
            Verifying email: <strong>{registeredEmail}</strong>
          </p>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <label className="auth-label">
              Full name
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </label>
          )}

          {!isOtp && (
            <label className="auth-label">
              College email
              <input
                type="email"
                placeholder="you@chitkara.edu.in"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
          )}

          {isRegister && (
            <label className="auth-label">
              College or campus
              <input
                type="text"
                placeholder="Your college name"
                value={college}
                onChange={(event) => setCollege(event.target.value)}
                required
              />
            </label>
          )}

          {isRegister && (
            <label className="auth-label">
              Student ID <span>(optional)</span>
              <input
                type="text"
                placeholder="Your student ID"
                value={studentId}
                onChange={(event) => setStudentId(event.target.value)}
              />
            </label>
          )}

          {!isOtp && (
            <label className="auth-label">
              Password
              <input
                type="password"
                placeholder="At least 6 characters"
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={6}
                required
              />
            </label>
          )}

          {isOtp && (
            <label className="auth-label">
              Six-digit verification code
              <input
                type="text"
                inputMode="numeric"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(event) => {
                  setOtp(event.target.value);
                  setOtpMessage('');
                }}
                pattern="[0-9]{6}"
                maxLength={6}
                required
              />
            </label>
          )}

          {otpMessage && (
            <p className="image-error" role="alert">
              {otpMessage}
            </p>
          )}

          <button className="auth-submit" type="submit" disabled={submitting}>
            {isOtp
              ? 'Verify & continue'
              : isRegister
                ? (submitting ? 'Creating account...' : 'Create account →')
                : (submitting ? 'Sending code...' : 'Log in →')}
          </button>

          {isOtp && (
            <div className="auth-resend">
              <button type="button" className="auth-resend-button" onClick={handleResend}>
                Return to login to request a new code
              </button>
            </div>
          )}
        </form>

        {isOtp && (
          <p className="auth-demo-note">
            In local development, the fallback code is printed by the backend when email is not configured.
          </p>
        )}

        {!isOtp && (
          <p className="auth-switch">
            {isRegister ? 'Already a member?' : 'New to Saanjha?'}{' '}
            <Link to={isRegister ? '/login' : '/register'}>
              {isRegister ? 'Log in' : 'Create an account'}
            </Link>
          </p>
        )}

        {isOtp && (
          <p className="auth-switch">
            <Link to="/register">← Back to registration</Link>
          </p>
        )}
      </section>

      <p className="auth-footer">
        Made with love for your campus community
      </p>
    </main>
  );
}

export default AuthPage;
