import React from 'react';
import './InfoSection.css';

const InfoSection = () => {
  return (
    <div className="info-section">
      <div className="info-container">
        <div className="info-header">
          <div className="header-left">
            <div className="title-icon">📈</div>
            <h1 className="section-title">Analytics Overview</h1>
          </div>
          <div className="header-right">
            <div className="status-badge">Online</div>
            <div className="summary-text">Total Sessions: 0 | User Engagement: 0% repeat rate</div>
          </div>
        </div>
        
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon">👥</div>
            <div className="metric-label">Total Users</div>
            <div className="metric-value">0</div>
            <div className="metric-description">Registered users</div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon">⏰</div>
            <div className="metric-label">Active Queue</div>
            <div className="metric-value">0</div>
            <div className="metric-description">Currently in queue</div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon">🔄</div>
            <div className="metric-label">Repeat Users</div>
            <div className="metric-value">0</div>
            <div className="metric-description">Multiple sessions</div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon">📊</div>
            <div className="metric-label">Avg Sessions</div>
            <div className="metric-value">0</div>
            <div className="metric-description">Per user</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoSection;
