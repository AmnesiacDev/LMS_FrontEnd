import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [verificationMsg, setVerificationMsg] = useState(null);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, login, signup, loading, error, setError } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    setVerificationMsg(null);
    return () => {
      setError(null);
    };
  }, [isLogin, setError]);

  const [formData, setFormData] = useState({
    FullName: '',
    UserName: '',
    Email: '',
    password: '',
    passwordConfirm: '',
    role: 'student'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLogin) {
      const success = await login(formData.Email, formData.password);
      if (success) navigate('/dashboard');
    } else {
      const result = await signup({
        FullName: formData.FullName,
        UserName: formData.UserName,
        Email: formData.Email,
        password: formData.password,
        role: formData.role,
      });

      if (result.success && result.needsVerification) {
        setVerificationMsg(result.message);
      } else if (result.success) {
        navigate('/dashboard');
      }
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
  };

  return (
    <div className="auth-container">
      <div className="auth-visual">
         <div className="auth-visual-content">
            <h1>Welcome to AlgoGambit</h1>
            <p>Access your curriculum, track progress, and manage learning in one place.</p>
         </div>
      </div>

      <div className="auth-form-wrapper">
         <button className="theme-toggle-btn" onClick={toggleTheme}>
            {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
         </button>
         
         <div className="auth-form-container glass-panel">
            <h2>{isLogin ? 'Welcome Back' : 'Create an Account'}</h2>
            <p className="auth-subtitle">
              {isLogin ? 'Enter your credentials to access your dashboard.' : 'Sign up to embark on your learning journey.'}
            </p>

            {error && (
              <div className="auth-error-msg">
                {error}
              </div>
            )}

            {verificationMsg && (
              <div className="auth-success-msg" style={{
                background: 'var(--success, #22c55e)',
                color: '#fff',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-sm, 6px)',
                marginBottom: '1rem',
                fontWeight: 600,
                fontSize: '0.9rem',
                border: '2px solid var(--border-color, #333)',
                textAlign: 'center',
              }}>
                {verificationMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
               {!isLogin && (
                 <>
                   <div className="form-group">
                     <label>Full Name</label>
                     <input type="text" name="FullName" value={formData.FullName} onChange={handleChange} placeholder="John Doe" required={!isLogin} />
                   </div>
                   <div className="form-group">
                     <label>Username</label>
                     <input type="text" name="UserName" value={formData.UserName} onChange={handleChange} placeholder="johndoe123" required={!isLogin} />
                   </div>
                 </>
               )}
               <div className="form-group">
                 <label>Email Address</label>
                 <input type="email" name="Email" value={formData.Email} onChange={handleChange} placeholder="you@example.com" required />
               </div>
               <div className="form-group">
                 <label>Password</label>
                 <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required />
               </div>
               {!isLogin && (
                 <div className="form-group">
                   <label>I am a...</label>
                   <select name="role" value={formData.role} onChange={handleChange} className="auth-select">
                     <option value="student">Student</option>
                     <option value="parent">Parent</option>
                     <option value="instructor">Instructor</option>
                   </select>
                 </div>
               )}
               
               <button type="submit" className="auth-submit-btn" disabled={loading}>
                 {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
               </button>
            </form>

            <div className="auth-switch">
              <span>{isLogin ? "Don't have an account?" : "Already have an account?"}</span>
              <button className="switch-btn" onClick={toggleMode} type="button">
                {isLogin ? 'Sign Up' : 'Log In'}
              </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Auth;
