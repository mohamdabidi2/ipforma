import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import AdminDashboard from './pages/dashboards/AdminDashboard';
import ReceptionDashboard from './pages/dashboards/ReceptionDashboard';
import TeacherDashboard from './pages/dashboards/TeacherDashboard';
import StudentDashboard from './pages/dashboards/StudentDashboard';
import Login from './components/Login';
import Register from './components/Register';
import './App.css';
import DashboardLayout from './components/layouts/DashboardLayout';
import PublicLayout from './components/layouts/PublicLayout';
import About from './pages/About';
import Formations from './pages/Formations';
import FormationDetails from './pages/FormationDetails';
import Contact from './pages/Contact';
import Home from './pages/Home';

// ScrollToTop component to handle scrolling
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Dashboard Router Component
const DashboardRouter = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Route to appropriate dashboard based on user role
  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'reception':
      return <ReceptionDashboard />;
    case 'teacher':
      return <TeacherDashboard />;
    case 'student':
      return <StudentDashboard />;
    default:
      return <Navigate to="/unauthorized" replace />;
  }
};

// Unauthorized Component
const Unauthorized = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Accès non autorisé
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
          {user && (
            <p className="mt-2 text-sm text-gray-500">
              Connecté en tant que: {user.name} ({user.role})
            </p>
          )}
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => window.history.back()}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Retour
          </button>
          <button
            onClick={logout}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const AppContent = () => {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          <PublicLayout><Login /></PublicLayout>
        } />
        <Route path="/register" element={
          <PublicLayout><Register /></PublicLayout>
        } />
        <Route path="/" element={
          <PublicLayout><Home /></PublicLayout>
        } />
        <Route path="/about" element={
          <PublicLayout><About /></PublicLayout>
        } />
        <Route path="/formations" element={
          <PublicLayout><Formations /></PublicLayout>
        } />
        <Route path="/contact" element={
          <PublicLayout><Contact /></PublicLayout>
        } />
        <Route path="/formations/:id" element={
          <PublicLayout><FormationDetails /></PublicLayout>
        } />

        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout>
              <DashboardRouter />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Role-specific Dashboard Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout>
              <AdminDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/reception" element={
          <ProtectedRoute allowedRoles={['reception']}>
            <DashboardLayout>
              <ReceptionDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/teacher" element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <DashboardLayout>
              <TeacherDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/student" element={
          <ProtectedRoute allowedRoles={['student']}>
            <DashboardLayout>
              <StudentDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Error Routes */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Catch all route */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-gray-600 mb-4">Page non trouvée</p>
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Retour
              </button>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
};

// Root App Component
const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;