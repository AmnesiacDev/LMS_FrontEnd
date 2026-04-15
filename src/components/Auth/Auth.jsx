import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { login, signup, loading, error } = useAuth();

  // Form State
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
    let success = false;
    
    if (isLogin) {
      success = await login(formData.Email, formData.password);
    } else {
      success = await signup({
        FullName: formData.FullName,
        UserName: formData.UserName,
        Email: formData.Email,
        password: formData.password,
        role: formData.role,
      });
    }

    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="auth-container">
      {/* Visual / Branding Side */}
      <div className="auth-visual">
         <div className="auth-visual-content">
            <h1>Elevate Your Learning</h1>
            <p>Access your curriculum, track progress, and interact with sessions dynamically.</p>
         </div>
      </div>

      {/* Form Side */}
      <div className="auth-form-wrapper">
         <button className="theme-toggle-btn" onClick={toggleTheme}>
            {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
         </button>
         
         <div className="auth-form-container glass-panel">
            <h2>{isLogin ? 'Welcome Back' : 'Create an Account'}</h2>
            <p className="auth-subtitle">
              {isLogin ? 'Enter your credentials to access your dashboard.' : 'Sign up to embark on your learning journey.'}
            </p>

            {error && <div className="auth-error-msg" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', border: '1px solid var(--error)' }}>{error}</div>}

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
                   <select name="role" value={formData.role} onChange={handleChange} style={{
                     padding: '0.75rem 1rem',
                     borderRadius: 'var(--radius-md)',
                     border: '1px solid var(--border-color)',
                     background: 'var(--bg-secondary)',
                     color: 'var(--text-primary)',
                     fontFamily: 'inherit',
                     fontSize: '1rem',
                   }}>
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
              <button 
                className="switch-btn" 
                onClick={() => setIsLogin(!isLogin)}
                type="button"
              >
                {isLogin ? 'Sign Up' : 'Log In'}
              </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Auth;
