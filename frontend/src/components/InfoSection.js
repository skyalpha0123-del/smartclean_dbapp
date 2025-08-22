import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './InfoSection.css';

const InfoSection = ({ onFilterChange }) => {
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
  const [activeFilter, setActiveFilter] = useState('all');
  const wsRef = useRef(null);

  useEffect(() => {
    fetchAnalyticsData();
    
    const wsUrl = `ws://${window.location.hostname}:${window.location.port === '3000' ? '5000' : window.location.port}`;
    wsRef.current = new WebSocket(wsUrl);
    
    wsRef.current.onopen = () => {
      console.log('WebSocket connected for real-time analytics updates');
    };
    
    wsRef.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'database_change') {
          console.log('Database change detected, refreshing analytics:', message);
          fetchAnalyticsData();
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected');
    };
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
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

  const handleFilterClick = (filterType) => {
    setActiveFilter(filterType);
    if (onFilterChange) {
      onFilterChange(filterType);
    }
  };

  return (
    <div className="info-section">
      <div className="info-container">
        <div className="info-header">
          <div className="header-left">
            <div className="title-section">
              <div className="title-icon">📈</div>
              <h1 className="section-title">Analytics Overview</h1>
            </div>
            <div className="realtime-indicator">
              <span className="indicator-dot"></span>
              <span className="indicator-text">Real-time updates active</span>
            </div>
          </div>
          <div className="header-right">
            <div className={`status-badge ${analyticsData.siteStatus?.isOnline ? 'online' : 'offline'}`}>
              {analyticsData.siteStatus?.isOnline ? 'Online' : 'Offline'}
            </div>
            <div className="summary-text">
              Total Users: {analyticsData.totalUsers} | User Engagement: {analyticsData.repeatUsers > 0 ? Math.round((analyticsData.repeatUsers / analyticsData.totalUsers) * 100) : 0}% repeat rate
            </div>
          </div>
        </div>
        
        <div className="metrics-grid">
          <div 
            className={`metric-card ${activeFilter === 'all' ? 'active' : ''} clickable`}
            onClick={() => handleFilterClick('all')}
            title="Click to show all users"
          >
            <div className="metric-icon">👥</div>
            <div className="metric-label">Total Users</div>
            <div className="metric-value">{loading ? '...' : analyticsData.totalUsers}</div>
            <div className="metric-description">Registered users</div>
          </div>
          
          <div 
            className={`metric-card ${activeFilter === 'activeQueue' ? 'active' : ''} clickable`}
            onClick={() => handleFilterClick('activeQueue')}
            title="Click to show users in queue"
          >
            <div className="metric-icon">⏰</div>
            <div className="metric-label">Active Queue</div>
            <div className="metric-value">{loading ? '...' : analyticsData.activeQueue}</div>
            <div className="metric-description">Users waiting to start session</div>
          </div>
          
          <div 
            className={`metric-card ${activeFilter === 'repeatUsers' ? 'active' : ''} clickable`}
            onClick={() => handleFilterClick('repeatUsers')}
            title="Click to show repeat users"
          >
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
