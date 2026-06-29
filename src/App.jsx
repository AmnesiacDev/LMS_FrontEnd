import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import LandingLayout from './components/Layout/LandingLayout';
import DashboardLayout from './components/Layout/DashboardLayout';

import Auth from './components/Auth/Auth';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
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
import ProgressPage from './pages/Dashboard/ProgressPage';
import ExamsPage from './pages/Dashboard/ExamsPage';
import MessagesPage from './pages/Dashboard/MessagesPage';
import AnnouncementsPage from './pages/Dashboard/AnnouncementsPage';
import AuditLogsPage from './pages/Dashboard/AuditLogsPage';
import AccountProfilePage from './pages/Dashboard/AccountProfilePage';
import WeeklySchedulePage from './pages/Dashboard/WeeklySchedulePage';
import LeaderboardPage from './pages/Dashboard/LeaderboardPage';
import ChallengesPage from './pages/Dashboard/ChallengesPage';
import InstructorChallengesPage from './pages/Dashboard/InstructorChallengesPage';
import NotificationsPage from './pages/Dashboard/NotificationsPage';
import CurriculumPage from './pages/Dashboard/CurriculumPage';
import LessonViewPage from './pages/Dashboard/LessonViewPage';
import AchievementsPage from './pages/Dashboard/AchievementsPage';
import { SocketProvider } from './context/SocketContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <SocketProvider>
            <div className="app-container">
              <Routes>
                <Route path="/" element={<LandingLayout />}>
                  <Route index element={<Home />} />
                  <Route path="about" element={<About />} />
                  <Route path="contact" element={<Contact />} />
                </Route>

                <Route path="/login" element={<Auth />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />

                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route path="/forbidden" element={<Error403 />} />

                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<DashboardIndex />} />

                  <Route path="account" element={
                    <ProtectedRoute allowedRoles={['student', 'parent', 'instructor', 'admin']}>
                      <AccountProfilePage />
                    </ProtectedRoute>
                  } />

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
                    <ProtectedRoute allowedRoles={['student', 'instructor', 'admin']}>
                      <ReviewsPage />
                    </ProtectedRoute>
                  } />

                  <Route path="external" element={
                    <ProtectedRoute allowedRoles={['student', 'parent', 'instructor', 'admin']}>
                      <ExternalCoursesPage />
                    </ProtectedRoute>
                  } />

                  <Route path="announcements" element={
                    <ProtectedRoute allowedRoles={['student', 'parent', 'instructor', 'admin']}>
                      <AnnouncementsPage />
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

                  <Route path="progress" element={
                    <ProtectedRoute allowedRoles={['student', 'parent', 'instructor', 'admin']}>
                      <ProgressPage />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="progress/:profileId" element={
                    <ProtectedRoute allowedRoles={['parent', 'admin', 'instructor']}>
                      <ProgressPage />
                    </ProtectedRoute>
                  } />

                  <Route path="exams" element={
                    <ProtectedRoute allowedRoles={['student', 'parent', 'instructor', 'admin']}>
                      <ExamsPage />
                    </ProtectedRoute>
                  } />

                  <Route path="messages" element={
                    <ProtectedRoute allowedRoles={['student', 'parent', 'instructor', 'admin']}>
                      <MessagesPage />
                    </ProtectedRoute>
                  } />

                  <Route path="messages/:userId" element={
                    <ProtectedRoute allowedRoles={['student', 'parent', 'instructor', 'admin']}>
                      <MessagesPage />
                    </ProtectedRoute>
                  } />

                  <Route path="schedule" element={
                    <ProtectedRoute allowedRoles={['student', 'parent', 'instructor', 'admin']}>
                      <WeeklySchedulePage />
                    </ProtectedRoute>
                  } />

                  <Route path="audit-logs" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AuditLogsPage />
                    </ProtectedRoute>
                  } />

                  <Route path="leaderboard" element={
                    <ProtectedRoute allowedRoles={['student', 'parent', 'instructor', 'admin']}>
                      <LeaderboardPage />
                    </ProtectedRoute>
                  } />

                  <Route path="achievements" element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <AchievementsPage />
                    </ProtectedRoute>
                  } />

                  <Route path="curriculum" element={
                    <ProtectedRoute allowedRoles={['student', 'parent', 'instructor', 'admin']}>
                      <CurriculumPage />
                    </ProtectedRoute>
                  } />

                  <Route path="curriculum/lessons/:lessonId" element={
                    <ProtectedRoute allowedRoles={['student', 'parent', 'instructor', 'admin']}>
                      <LessonViewPage />
                    </ProtectedRoute>
                  } />

                  <Route path="challenges" element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <ChallengesPage />
                    </ProtectedRoute>
                  } />

                  <Route path="challenges/manage" element={
                    <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                      <InstructorChallengesPage />
                    </ProtectedRoute>
                  } />

                  <Route path="notifications" element={
                    <ProtectedRoute allowedRoles={['student', 'parent', 'instructor', 'admin']}>
                      <NotificationsPage />
                    </ProtectedRoute>
                  } />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </SocketProvider>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
