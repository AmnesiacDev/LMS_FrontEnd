import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import LandingLayout from './components/Layout/LandingLayout';
import DashboardLayout from './components/Layout/DashboardLayout';

import Auth from './components/Auth/Auth';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';
import Error403 from './pages/Error403';
import DashboardIndex from './pages/Dashboard/DashboardIndex';
import SessionsPage from './pages/Dashboard/SessionsPage';
import TasksPage from './pages/Dashboard/TasksPage';
import SubmissionsPage from './pages/Dashboard/SubmissionsPage';
import ReviewsPage from './pages/Dashboard/ReviewsPage';
import ExternalCoursesPage from './pages/Dashboard/ExternalCoursesPage';
import UsersPage from './pages/Dashboard/UsersPage';
import StudentProfilesPage from './pages/Dashboard/StudentProfilesPage';
import ChildDetailsPage from './pages/Dashboard/ChildDetailsPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="app-container">
            <Routes>
              <Route path="/" element={<LandingLayout />}>
                <Route index element={<Home />} />
                <Route path="about" element={<About />} />
                <Route path="contact" element={<Contact />} />
              </Route>

              <Route path="/login" element={<Auth />} />

              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/forbidden" element={<Error403 />} />

              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route index element={<DashboardIndex />} />

                <Route path="sessions" element={
                  <ProtectedRoute allowedRoles={['student', 'parent', 'instructor', 'admin']}>
                    <SessionsPage />
                  </ProtectedRoute>
                } />

                <Route path="tasks" element={
                  <ProtectedRoute allowedRoles={['student', 'parent', 'instructor', 'admin']}>
                    <TasksPage />
                  </ProtectedRoute>
                } />

                <Route path="submissions" element={
                  <ProtectedRoute allowedRoles={['student', 'parent', 'instructor', 'admin']}>
                    <SubmissionsPage />
                  </ProtectedRoute>
                } />

                <Route path="reviews" element={
                  <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                    <ReviewsPage />
                  </ProtectedRoute>
                } />

                <Route path="external" element={
                  <ProtectedRoute allowedRoles={['student', 'parent', 'instructor', 'admin']}>
                    <ExternalCoursesPage />
                  </ProtectedRoute>
                } />

                <Route path="users" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <UsersPage />
                  </ProtectedRoute>
                } />

                <Route path="profiles" element={
                  <ProtectedRoute allowedRoles={['admin', 'parent', 'instructor']}>
                    <StudentProfilesPage />
                  </ProtectedRoute>
                } />

                <Route path="child/:profileId" element={
                  <ProtectedRoute allowedRoles={['parent', 'admin', 'instructor']}>
                    <ChildDetailsPage />
                  </ProtectedRoute>
                } />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;