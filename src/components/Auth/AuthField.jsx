import React, { useId, useState } from 'react';

/**
 * Form primitives for the auth screens.
 *
 * Both fields render a leading glyph inside the control, an uppercase label,
 * and the brutalist focus treatment (ink border + hard offset shadow) defined
 * in Auth.css. PasswordField adds a reveal toggle, a Caps Lock warning, and an
 * optional strength meter.
 */

const STRENGTH_LABELS = ['Too short', 'Weak', 'Fair', 'Strong', 'Excellent'];

/** Rough client-side score, 0–4. Guidance only — the API is the real gate. */
const scorePassword = (value) => {
  if (!value) return -1;
  if (value.length < 8) return 0;

  let score = 1;
  if (value.length >= 12) score += 1;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
  if (/\d/.test(value) && /[^A-Za-z0-9]/.test(value)) score += 1;
  return Math.min(score, 4);
};

export const TextField = ({ label, icon, hint, ...inputProps }) => {
  const id = useId();

  return (
    <div className="auth-field">
      <label className="auth-label" htmlFor={id}>{label}</label>
      <div className="auth-control">
        <i className={`auth-control-icon ${icon}`} aria-hidden="true" />
        <input id={id} className="auth-input" {...inputProps} />
      </div>
      {hint && <p className="auth-hint">{hint}</p>}
    </div>
  );
};

export const PasswordField = ({ label, value, strength = false, trailing, ...inputProps }) => {
  const id = useId();
  const [revealed, setRevealed] = useState(false);
  const [capsOn, setCapsOn] = useState(false);

  // getModifierState is unavailable on some synthetic events (autofill, IME).
  const readCaps = (event) => {
    if (typeof event.getModifierState === 'function') setCapsOn(event.getModifierState('CapsLock'));
  };

  const score = strength ? scorePassword(value) : -1;

  return (
    <div className="auth-field">
      <div className="auth-label-row">
        <label className="auth-label" htmlFor={id}>{label}</label>
        {trailing}
      </div>

      <div className="auth-control">
        <i className="auth-control-icon fa-solid fa-lock" aria-hidden="true" />
        <input
          id={id}
          className="auth-input"
          type={revealed ? 'text' : 'password'}
          value={value}
          onKeyUp={readCaps}
          onKeyDown={readCaps}
          onBlur={() => setCapsOn(false)}
          {...inputProps}
        />
        <button
          type="button"
          className="auth-reveal-btn"
          onClick={() => setRevealed((prev) => !prev)}
          aria-label={revealed ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          <i className={revealed ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'} aria-hidden="true" />
        </button>
      </div>

      {capsOn && (
        <p className="auth-hint auth-hint-warn">
          <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" /> Caps Lock is on
        </p>
      )}

      {strength && score >= 0 && (
        <div className="auth-strength" data-score={score}>
          <div className="auth-strength-bars" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className={i < score ? 'is-filled' : ''} />
            ))}
          </div>
          <span className="auth-strength-label">{STRENGTH_LABELS[score]}</span>
        </div>
      )}
    </div>
  );
};
