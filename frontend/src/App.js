import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import InfoSection from './components/InfoSection';
import DataTable from './components/DataTable';
import ProtectedRoute from './components/ProtectedRoute';


const SimpleHeader = () => {
  const { user, logout } = useAuth();

  return (
    <header className="simple-header">
      <div className="header-content">
        <h1>SmartClean</h1>
                       <div className="user-info">
                 <span>Welcome, {user?.email}</span>
                 <button onClick={logout} className="btn btn-secondary btn-small">
                   Logout
                 </button>
               </div>
      </div>
    </header>
  );
};


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
                <InfoSection />
                <DataTable />
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
