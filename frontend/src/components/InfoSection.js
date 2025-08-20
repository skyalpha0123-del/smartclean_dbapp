import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './InfoSection.css';

const InfoSection = () => {
  const [analyticsData, setAnalyticsData] = useState({
    totalUsers: 0,
    activeQueue: 0,
    repeatUsers: 0,
    avgSessions: 0,
    siteStatus: {
      isOnline: false,
      lastChecked: null,
      siteUrl: ''
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/analytics');
      setAnalyticsData(response.data.data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        console.log('⚠️  Backend server not accessible');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="info-section">
      <div className="info-container">
        <div className="info-header">
          <div className="header-left">
            <div className="title-icon">📈</div>
            <h1 className="section-title">Analytics Overview</h1>
          </div>
          <div className="header-right">
            <div className={`status-badge ${analyticsData.siteStatus?.isOnline ? 'online' : 'offline'}`}>
              {analyticsData.siteStatus?.isOnline ? 'Online' : 'Offline'}
            </div>
            <div className="summary-text">
              Total Sessions: {analyticsData.totalUsers} | User Engagement: {analyticsData.repeatUsers > 0 ? Math.round((analyticsData.repeatUsers / analyticsData.totalUsers) * 100) : 0}% repeat rate
            </div>
          </div>
        </div>
        
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon">👥</div>
            <div className="metric-label">Total Users</div>
            <div className="metric-value">{loading ? '...' : analyticsData.totalUsers}</div>
            <div className="metric-description">Registered users</div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon">⏰</div>
            <div className="metric-label">Active Queue</div>
            <div className="metric-value">{loading ? '...' : analyticsData.activeQueue}</div>
            <div className="metric-description">Currently in queue</div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon">🔄</div>
            <div className="metric-label">Repeat Users</div>
            <div className="metric-value">{loading ? '...' : analyticsData.repeatUsers}</div>
            <div className="metric-description">Users with 2+ sessions</div>
          </div>
          
                     <div className="metric-card">
             <div className="metric-icon">📊</div>
             <div className="metric-label">Avg Session Time</div>
             <div className="metric-value">{loading ? '...' : `${analyticsData.avgSessions.toFixed(1)} min`}</div>
             <div className="metric-description">Minutes per session</div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default InfoSection;
