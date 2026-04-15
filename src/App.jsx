import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

// Layouts
import LandingLayout from './components/Layout/LandingLayout';
import DashboardLayout from './components/Layout/DashboardLayout';

// Pages
import Auth from './components/Auth/Auth';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import DashboardIndex from './pages/Dashboard/DashboardIndex';
import SessionsPage from './pages/Dashboard/SessionsPage';
import TasksPage from './pages/Dashboard/TasksPage';
import SubmissionsPage from './pages/Dashboard/SubmissionsPage';
import ReviewsPage from './pages/Dashboard/ReviewsPage';
import ExternalCoursesPage from './pages/Dashboard/ExternalCoursesPage';
import UsersPage from './pages/Dashboard/UsersPage';
import StudentProfilesPage from './pages/Dashboard/StudentProfilesPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="app-container">
          <Routes>
            {/* Public Landing Pages with Top Navbar */}
            <Route path="/" element={<LandingLayout />}>
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />
            </Route>

            {/* Standalone Pages */}
            <Route path="/login" element={<Auth />} />

            {/* Dashboard Protected Routes */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardIndex />} />

              {/* Shared Routes */}
              <Route path="sessions" element={<SessionsPage />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="submissions" element={<SubmissionsPage />} />
              <Route path="reviews" element={<ReviewsPage />} />
              <Route path="external" element={<ExternalCoursesPage />} />
              
              {/* Admin-only Routes */}
              <Route path="users" element={<UsersPage />} />
              <Route path="profiles" element={<StudentProfilesPage />} />
              
              {/* Parent viewing a specific child */}
              <Route path="child/:profileId" element={<div style={{padding:'2rem'}}><h2>Child Details</h2><p style={{color:'var(--text-secondary)'}}>Child-specific metrics coming soon.</p></div>} />
            </Route>
            
            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
