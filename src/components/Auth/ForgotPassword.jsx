import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { buildApiUrl } from '../../utils/apiUrl';
import { sanitizeErrorMessage } from '../../utils/errorSanitizer';
import AuthShell from './AuthShell';
import { TextField } from './AuthField';
import './Auth.css';

const POINTS = [
  { icon: 'fa-solid fa-envelope-circle-check', text: 'A signed link lands in your inbox' },
  { icon: 'fa-solid fa-clock', text: 'The link expires shortly after it is issued' },
  { icon: 'fa-solid fa-shield-halved', text: 'Your current password stays valid until you change it' },
];

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch(buildApiUrl('/api/v1/auth/forgot-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(sanitizeErrorMessage(data.message || 'Could not send reset link.'));

      setMessage(data.message || 'If this email exists, a password reset link has been sent.');
    } catch (err) {
      setError(sanitizeErrorMessage(err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      headline="Locked out? Happens to everyone."
      blurb="Give us the email on your AlgoGambit account and we will send a secure link to set a new password."
      points={POINTS}
    >
      <section className="auth-card" data-no-drag>
        <span className="auth-card-badge">
          <i className="fa-solid fa-key" aria-hidden="true" /> Account recovery
        </span>

        <h2 className="auth-card-title">Forgot password</h2>
        <p className="auth-card-sub">Use the email connected to your AlgoGambit account.</p>

        {error && (
          <div className="auth-error-msg" role="alert">
            <i className="fa-solid fa-circle-exclamation" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}
        {message && (
          <div className="auth-success-msg" role="status">
            <i className="fa-solid fa-circle-check" aria-hidden="true" />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <TextField
            label="Email address"
            icon="fa-solid fa-envelope"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            inputMode="email"
            autoFocus
            required
          />

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? (
              <>
                <i className="fa-solid fa-circle-notch auth-spin" aria-hidden="true" />
                Sending…
              </>
            ) : (
              <>
                Send reset link
                <i className="fa-solid fa-paper-plane" aria-hidden="true" />
              </>
            )}
          </button>
        </form>

        <p className="auth-switch">
          Remember your password?
          <Link className="switch-btn" to="/login">Sign in</Link>
        </p>
      </section>
    </AuthShell>
  );
};

export default ForgotPassword;
