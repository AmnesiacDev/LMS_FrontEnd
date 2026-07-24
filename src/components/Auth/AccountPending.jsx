import { Link, useLocation } from "react-router-dom";
import AuthShell from "./AuthShell";
import "./Auth.css";

const AccountPending = () => {
  const location = useLocation();
  const email = location.state?.email;

  return (
    <AuthShell
      headline="Your account request is in orbit."
      blurb="An administrator needs to review it before the learning dashboard becomes available."
      points={[
        {
          icon: "fa-solid fa-user-clock",
          text: "Your account is safely saved",
        },
        {
          icon: "fa-solid fa-shield-heart",
          text: "Approval protects students and families",
        },
        {
          icon: "fa-solid fa-envelope",
          text: "Use the same email to sign in after approval",
        },
      ]}
    >
      <section className="auth-card auth-pending-card" data-no-drag>
        <div className="auth-pending-icon" aria-hidden="true">
          <i className="fa-solid fa-hourglass-half" />
        </div>
        <h2 className="auth-card-title">Waiting for approval</h2>
        <p className="auth-card-sub">
          Your account request{email ? ` for ${email}` : ""} was sent
          successfully. You cannot use the dashboard until an administrator
          approves it.
        </p>
        <p className="auth-pending-note" role="status">
          Please check back later, then sign in with the email address and
          password you created.
        </p>
        <Link to="/login" className="auth-submit-btn auth-pending-link">
          Back to sign in
          <i className="fa-solid fa-arrow-right" aria-hidden="true" />
        </Link>
      </section>
    </AuthShell>
  );
};

export default AccountPending;
