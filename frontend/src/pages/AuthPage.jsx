
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function AuthPage({ mode }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpMessage, setOtpMessage] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [resendMessage, setResendMessage] = useState('');

  const isRegister = mode === 'register';
  const isOtp = mode === 'otp';
  const registeredEmail = location.state?.email || '';

  useEffect(() => {
    if (!isOtp || resendTimer <= 0) return;

    const timerId = setTimeout(() => {
      setResendTimer((previous) => previous - 1);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [isOtp, resendTimer]);

  function handleSubmit(event) {
    event.preventDefault();
    setOtpMessage('');

    if (isRegister) {
      setResendMessage('');

      const normalizedEmail = email.trim().toLowerCase();
      const existingEmail = localStorage.getItem('saanjhaEmail');

      if (existingEmail?.toLowerCase() === normalizedEmail) {
        setOtpMessage(
          'This email is already registered. Please log in instead.'
        );
        return;
      }

      // Demo only: localStorage is not secure for storing passwords.
      localStorage.setItem('saanjhaName', name.trim());
      localStorage.setItem('saanjhaEmail', normalizedEmail);
      localStorage.setItem('saanjhaPassword', password);

      navigate('/verify-otp', {
        state: {
          name: name.trim(),
          email: normalizedEmail,
        },
      });
    } else if (isOtp) {
      if (otp === '1234') {
        setOtpMessage('');

        // Remember that this demo email was verified.
        const verifiedEmail = location.state?.email;

        if (verifiedEmail) {
          localStorage.setItem(
            'saanjhaVerifiedEmail',
            verifiedEmail.toLowerCase()
          );
        }

        navigate('/login', {
          state: {
            emailVerified: true,
            email: verifiedEmail,
          },
        });
      } else {
        setOtpMessage('Incorrect code. Please enter the demo code 1234.');
      }
    } else {
      const savedEmail = localStorage.getItem('saanjhaEmail');
      const savedPassword = localStorage.getItem('saanjhaPassword');
      const verifiedEmail = localStorage.getItem('saanjhaVerifiedEmail');
      const normalizedEmail = email.trim().toLowerCase();

      if (
        !savedEmail ||
        !savedPassword ||
        normalizedEmail !== savedEmail.toLowerCase() ||
        password !== savedPassword
      ) {
        setOtpMessage(
          'Invalid email or password. Please check your details or register first.'
        );
        return;
      }

      if (verifiedEmail !== normalizedEmail) {
        setOtpMessage('Please verify your email before logging in.');
        return;
      }

      // Demo login: this is not real server-side authentication.
      localStorage.setItem('saanjhaLoggedIn', 'true');
      localStorage.setItem('saanjhaLoggedInEmail', normalizedEmail);

      navigate('/');
    }
  }

  function handleResend() {
    setResendTimer(30);
    setResendMessage(
      'Demo only: no email or OTP was actually sent. Use 1234.'
    );
    setOtpMessage('');
    setOtp('');
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
            ? 'Enter the demo code to continue your journey.'
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
                placeholder="you@college.edu"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
          )}

          {!isOtp && (
            <label className="auth-label">
              Password
              <input
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={6}
                required
              />
            </label>
          )}

          {isOtp && (
            <label className="auth-label">
              Demo verification code
              <input
                type="text"
                inputMode="numeric"
                placeholder="Enter 4-digit code"
                value={otp}
                onChange={(event) => {
                  setOtp(event.target.value);
                  setOtpMessage('');
                }}
                pattern="[0-9]{4}"
                maxLength={4}
                required
              />
            </label>
          )}

          {otpMessage && (
            <p className="image-error" role="alert">
              {otpMessage}
            </p>
          )}

          <button className="auth-submit" type="submit">
            {isOtp
              ? 'Verify & continue'
              : isRegister
                ? 'Create account →'
                : 'Log in →'}
          </button>

          {isOtp && (
            <div className="auth-resend">
              {resendTimer > 0 ? (
                <p>
                  Resend code in{' '}
                  <strong>
                    00:{String(resendTimer).padStart(2, '0')}
                  </strong>
                </p>
              ) : (
                <button
                  type="button"
                  className="auth-resend-button"
                  onClick={handleResend}
                >
                  Resend code
                </button>
              )}

              {resendMessage && (
                <p role="status">{resendMessage}</p>
              )}
            </div>
          )}
        </form>

        {isOtp && (
          <p className="auth-demo-note">
            Frontend demo only: no real email or OTP is sent.
            Use 1234 as the demo code.
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
