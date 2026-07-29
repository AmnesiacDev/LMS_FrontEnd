import React, { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../Logo/Logo';
import { useTheme } from '../../context/ThemeContext';
import useDeviceCapability from '../../hooks/useDeviceCapability';
import './Auth.css';

// three.js plus five equirectangular maps — kept out of the initial bundle and
// skipped entirely on devices that cannot spare the memory.
const CosmicScene = lazy(() => import('../CosmicScene/CosmicScene'));

/**
 * Chrome shared by every /login-family screen.
 *
 * Renders the deep-space WebGL backdrop used by the landing pages (in its
 * `auth` variant, which parks the globe to the left of the card), a slim top
 * bar, a marketing column, and a slot for the form card. Everything wears the
 * same neo-brutalist ink borders and hard offset shadows as the rest of the app.
 *
 * Props:
 *   headline / blurb — copy for the left-hand column
 *   points           — [{ icon, text }] bullets under the blurb
 *   children         — the form card
 */
const AuthShell = ({ headline, blurb, points = [], children }) => {
  const { theme, toggleTheme } = useTheme();
  const { lowPower } = useDeviceCapability();

  return (
    <div className="auth-stage">
      {lowPower ? (
        <div className="auth-sky" aria-hidden="true" />
      ) : (
        <Suspense fallback={<div className="auth-sky" aria-hidden="true" />}>
          <CosmicScene variant="auth" />
        </Suspense>
      )}

      <header className="auth-topbar">
        <Link to="/" className="auth-home-link" aria-label="AlgoGambit home">
          <Logo size="md" variant="full" />
        </Link>

        <div className="auth-topbar-actions">
          <Link to="/" className="auth-ghost-link">
            <i className="fa-solid fa-arrow-left" aria-hidden="true" />
            <span>Back to site</span>
          </Link>
          <button
            type="button"
            className="auth-theme-btn"
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
          >
            <i className={theme === 'light' ? 'fa-solid fa-moon' : 'fa-solid fa-sun'} aria-hidden="true" />
          </button>
        </div>
      </header>

      <main className="auth-layout">
        <section className="auth-pitch">
          <p className="auth-pitch-eyebrow">AlgoGambit Learning Platform</p>
          <h1 className="auth-pitch-title">{headline}</h1>
          <p className="auth-pitch-blurb">{blurb}</p>

          {points.length > 0 && (
            <ul className="auth-pitch-points">
              {points.map((point) => (
                <li key={point.text}>
                  <span className="auth-point-icon">
                    <i className={point.icon} aria-hidden="true" />
                  </span>
                  {point.text}
                </li>
              ))}
            </ul>
          )}
        </section>

        {children}
      </main>
    </div>
  );
};

export default AuthShell;
