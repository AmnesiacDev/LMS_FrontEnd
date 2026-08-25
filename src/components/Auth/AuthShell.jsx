import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../Logo/Logo';
import Typewriter from '../Typewriter/Typewriter';
import { useTheme } from '../../context/ThemeContext';
import './Auth.css';

/**
 * Chrome shared by every /login-family screen.
 *
 * Renders the gridded paper backdrop, a slim top bar, a marketing column, and
 * a slot for the form card. Everything wears the same neo-brutalist ink borders
 * and hard offset shadows as the rest of the app.
 *
 * The backdrop used to be a three.js scene (globe, stars, five equirectangular
 * maps). It cost a lazy chunk and a chunk of memory on every visit to a login
 * form, and had to be skipped on low-power devices anyway — so the page never
 * looked the same to everyone. Flat CSS renders identically everywhere.
 *
 * Props:
 *   headline / blurb — copy for the left-hand column
 *   points           — [{ icon, text }] bullets under the blurb
 *   children         — the form card
 */
const AuthShell = ({ headline, blurb, points = [], children }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="auth-stage">
      <div className="auth-sky" aria-hidden="true" />

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
          {/* Keyed on the headline so switching sign-in/create-account
              retypes the new line instead of resuming mid-word. */}
          <h1 className="auth-pitch-title">
            <Typewriter key={headline} text={headline} />
          </h1>
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
