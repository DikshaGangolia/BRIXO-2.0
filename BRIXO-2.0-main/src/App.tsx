import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './components/auth/Login';
import { Signup } from './components/auth/Signup';
import { ForgotPassword } from './components/auth/ForgotPassword';
import { Dashboard } from './components/dashboard/Dashboard';
import { BuilderInterface } from './components/builder/BuilderInterface';
import PreviewSite from './components/builder/PreviewSite';
import { useAuthStore } from './store/useAuthStore';

// Simple Auth Guard Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const session = useAuthStore(state => state.session);
  return session?.isLoggedIn ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  const session = useAuthStore(state => state.session);

  return (
    <Router>
      <div className="w-full h-full min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
        <Routes>
          {/* Public Auth routes */}
          <Route
            path="/login"
            element={session?.isLoggedIn ? <Navigate to="/dashboard" replace /> : <Login />}
          />
          <Route
            path="/signup"
            element={session?.isLoggedIn ? <Navigate to="/dashboard" replace /> : <Signup />}
          />
          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />

          {/* Protected SaaS routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/builder/:siteId"
            element={
              <ProtectedRoute>
                <BuilderInterface />
              </ProtectedRoute>
            }
          />
          <Route
            path="/preview/:siteId"
            element={<PreviewSite />}
          />
          <Route
            path="/site/:siteId"
            element={<PreviewSite />}
          />
          {/* Root Fallback */}
          <Route
            path="*"
            element={<Navigate to={session?.isLoggedIn ? "/dashboard" : "/login"} replace />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;