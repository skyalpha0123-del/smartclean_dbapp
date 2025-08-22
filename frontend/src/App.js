import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import Login from './components/Login';
import InfoSection from './components/InfoSection';
import DataTable from './components/DataTable';
import ProtectedRoute from './components/ProtectedRoute';

// Demo User Dialog Component
const DemoUserDialog = ({ user, onClose }) => {
  const { showSuccess, showError } = useToast();
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      showError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/users/update-demo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();
      
      if (result.success) {
        showSuccess('Demo user updated successfully!');
        setTimeout(() => {
          onClose();
          window.location.reload(); // Refresh to show updated email
        }, 1500);
      } else {
        showError(result.error || 'Failed to update demo user');
      }
    } catch (error) {
      showError('Error updating demo user: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="demo-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>Demo User Settings</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="dialog-content">
          <div className="admin-badge">
            <span className="admin-icon">👑</span>
            <span className="admin-text">Admin Privileges</span>
          </div>
          
          <p className="dialog-description">
            This demo user has administrative access to the system. You can modify authentication details below.
          </p>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">New Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
                className="form-input"
              />
            </div>
            

            
            <div className="dialog-actions">
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? 'Updating...' : 'Update Demo User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};


const SimpleHeader = () => {
  const { user, logout } = useAuth();
  const { showSuccess, showError } = useToast();
  const [mockLoading, setMockLoading] = useState(false);
  const [showDemoDialog, setShowDemoDialog] = useState(false);

  const handleMockUp = async () => {
    try {
      setMockLoading(true);
      const response = await fetch('/api/users/mock-up', { method: 'POST' });
      const result = await response.json();
      if (result.success) {
        const data = result.data;
        const total = data?.count || 0;
        const unique = data?.uniqueUsers || 0;
        const repeated = data?.repeatedUsers || 0;
        showSuccess(`Mock data generated successfully! 📊 Total: ${total}, 👤 Unique: ${unique}, 🔄 Repeated: ${repeated}`);
        window.location.reload(); // Refresh to show new data
      } else {
        showError('Failed to generate mock data: ' + result.error);
      }
    } catch (error) {
      showError('Error generating mock data: ' + error.message);
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
        const deletedCount = result.data?.deletedCount || 0;
        showSuccess(`Mock data cleared successfully! Deleted ${deletedCount} users.`);
        window.location.reload(); // Refresh to show updated data
      } else {
        showError('Failed to clear mock data: ' + result.error);
      }
    } catch (error) {
      showError('Error clearing mock data: ' + error.message);
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
          <div className="welcome-section">
            <span className="welcome-text">Welcome, {user?.email}</span>
            <button 
              className="gear-button"
              onClick={() => setShowDemoDialog(true)}
              title="Demo User Settings"
            >
              ⚙️
            </button>
          </div>
          <div className="button-row">
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
      </div>
      
      {/* Demo User Dialog */}
      {showDemoDialog && (
        <DemoUserDialog 
          user={user}
          onClose={() => setShowDemoDialog(false)}
        />
      )}
    </header>
  );
};


const AppContent = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  const handleFilterChange = (filterType) => {
    setActiveFilter(filterType);
  };

  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <div>
              <SimpleHeader />
              <main className="main-content">
                <InfoSection onFilterChange={handleFilterChange} />
                <DataTable activeFilter={activeFilter} />
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
      <ToastProvider>
        <Router>
          <AppContent />
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
