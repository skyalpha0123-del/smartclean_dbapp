import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import InfoSection from './components/InfoSection';
import DataTable from './components/DataTable';
import ProtectedRoute from './components/ProtectedRoute';


const SimpleHeader = () => {
  const { user, logout } = useAuth();
  const [mockLoading, setMockLoading] = useState(false);

  const handleMockUp = async () => {
    try {
      setMockLoading(true);
      const response = await fetch('/api/users/mock-up', { method: 'POST' });
      const result = await response.json();
      if (result.success) {
        const data = result.data;
        alert(`Mock data generated successfully!\n\n📊 Total Users: ${data.count}\n👤 Unique Users: ${data.uniqueUsers}\n🔄 Repeated Users: ${data.repeatedUsers}\n📧 Repeated Emails: ${data.repeatedEmails.join(', ')}`);
        window.location.reload(); // Refresh to show new data
      } else {
        alert('Failed to generate mock data: ' + result.error);
      }
    } catch (error) {
      alert('Error generating mock data: ' + error.message);
    } finally {
      setMockLoading(false);
    }
  };

  const handleMockDown = async () => {
    try {
      setMockLoading(true);
      const response = await fetch('/api/users/mock-down', { method: 'POST' });
      const result = await response.json();
      if (result.success) {
        alert(`Mock data cleared successfully! Deleted ${result.data.deletedCount} users.`);
        window.location.reload(); // Refresh to show updated data
      } else {
        alert('Failed to clear mock data: ' + result.error);
      }
    } catch (error) {
      alert('Error clearing mock data: ' + error.message);
    } finally {
      setMockLoading(false);
    }
  };

  return (
    <header className="simple-header">
      <div className="header-content">
        <div className="header-left">
          <img src="/sc_robot_logo.png" alt="SmartClean Logo" className="header-logo" />
          <h1>SmartClean</h1>
        </div>
        <div className="user-info">
          <span>Welcome, {user?.email}</span>
          <button 
            onClick={handleMockUp} 
            disabled={mockLoading}
            className="btn btn-primary btn-small"
            title="Generate 30 unique + 20 repeated mock users with non-overlapping sessions"
          >
            {mockLoading ? 'Loading...' : 'Mock Up'}
          </button>
          <button 
            onClick={handleMockDown} 
            disabled={mockLoading}
            className="btn btn-danger btn-small"
            title="Clear all mock data"
          >
            {mockLoading ? 'Loading...' : 'Mock Down'}
          </button>
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
