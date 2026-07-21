import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { buildApiUrl } from '../../utils/apiUrl';
import { sanitizeErrorMessage } from '../../utils/errorSanitizer';
import AuthShell from './AuthShell';
import { PasswordField } from './AuthField';
import './Auth.css';

const POINTS = [
  { icon: 'fa-solid fa-ruler-horizontal', text: 'At least 8 characters' },
  { icon: 'fa-solid fa-shuffle', text: 'Mix cases, digits and symbols' },
  { icon: 'fa-solid fa-ban', text: 'Never reuse a password from another site' },
];

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const mismatch = passwordConfirm.length > 0 && password !== passwordConfirm;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    if (password !== passwordConfirm) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(buildApiUrl(`/api/v1/auth/reset-password/${token}`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(sanitizeErrorMessage(data.message || 'Could not reset password.'));

      setMessage(data.message || 'Password reset successful. You can now log in.');
      setTimeout(() => navigate('/login', { replace: true }), 1500);
    } catch (err) {
      setError(sanitizeErrorMessage(err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      headline="Set a new password."
      blurb="Pick something you have never used anywhere else. You will be signed back in right after."
      points={POINTS}
    >
      <section className="auth-card" data-no-drag>
        <span className="auth-card-badge">
          <i className="fa-solid fa-rotate" aria-hidden="true" /> Password reset
        </span>

        <h2 className="auth-card-title">Reset password</h2>
        <p className="auth-card-sub">Your new password must be at least 8 characters.</p>

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
          <PasswordField
            label="New password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            minLength={8}
            strength
            autoFocus
            required
          />

          <PasswordField
            label="Confirm password"
            value={passwordConfirm}
            onChange={(event) => setPasswordConfirm(event.target.value)}
            placeholder="Repeat it"
            autoComplete="new-password"
            minLength={8}
            aria-invalid={mismatch}
            required
          />

          {mismatch && (
            <p className="auth-hint auth-hint-warn">
              <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" /> Passwords do not match yet
            </p>
          )}

          <button type="submit" className="auth-submit-btn" disabled={loading || mismatch}>
            {loading ? (
              <>
                <i className="fa-solid fa-circle-notch auth-spin" aria-hidden="true" />
                Resetting…
              </>
            ) : (
              <>
                Reset password
                <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              </>
            )}
          </button>
        </form>

        <p className="auth-switch">
          Already updated it?
          <Link className="switch-btn" to="/login">Sign in</Link>
        </p>
      </section>
    </AuthShell>
  );
};

export default ResetPassword;
