import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';

// Simple header with logout button
const SimpleHeader = () => {
  const { user, logout } = useAuth();

  return (
    <header className="simple-header">
      <div className="header-content">
        <h1>Database App</h1>
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
  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <div>
              <SimpleHeader />
              <main className="main-content">
                {/* UI is empty - displaying nothing as per requirements */}
              </main>
            </div>
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
