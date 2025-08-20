import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import InfoSection from './components/InfoSection';
import DataTable from './components/DataTable';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Simple header with logout button
const SimpleHeader = () => {
  const { user, logout } = useAuth();

  return (
    <header className="simple-header">
      <div className="header-content">
        <h1>SmartClean</h1>
        <div className="user-info">
          <span>Welcome, {user?.name}</span>
          <button onClick={logout} className="btn btn-secondary btn-small">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

// Main app content wrapper
const AppContent = () => {
  console.log('AppContent rendering...');
  
  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <div>
              <SimpleHeader />
              <main className="main-content">
                <InfoSection />
                <DataTable />
              </main>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/debug" element={
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>Debug Route</h1>
            <p>If you can see this, routing is working.</p>
            <a href="/login">Go to Login</a>
          </div>
        } />
        <Route path="*" element={
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>Route Not Found</h1>
            <p>Redirecting to home...</p>
            <Navigate to="/" replace />
          </div>
        } />
      </Routes>
    </div>
  );
};

function App() {
  console.log('App component rendering...');
  
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
