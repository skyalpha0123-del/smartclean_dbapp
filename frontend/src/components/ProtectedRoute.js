import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  console.log('ProtectedRoute: loading:', loading, 'isAuthenticated:', isAuthenticated());

  if (loading) {
    console.log('ProtectedRoute: showing loading state');
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated()) {
    console.log('ProtectedRoute: user not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('ProtectedRoute: user authenticated, rendering children');
  return children;
};

export default ProtectedRoute;
