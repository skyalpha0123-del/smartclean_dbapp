import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Welcome to Database App
          </h1>
          <p className="hero-subtitle">
            A modern full-stack application built with React and Express.js
          </p>
          <div className="hero-actions">
            <Link to="/users" className="btn btn-primary">
              View Users
            </Link>
            <Link to="/users/new" className="btn btn-secondary">
              Add New User
            </Link>
          </div>
        </div>
      </div>

      <div className="features-section">
        <div className="container">
          <h2 className="section-title">Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Fast & Responsive</h3>
              <p>Built with modern React hooks and optimized performance</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure Backend</h3>
              <p>Express.js with security middleware and rate limiting</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Mobile Friendly</h3>
              <p>Responsive design that works on all devices</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔄</div>
              <h3>Real-time Updates</h3>
              <p>Live data synchronization with the backend API</p>
            </div>
          </div>
        </div>
      </div>

      <div className="tech-section">
        <div className="container">
          <h2 className="section-title">Technology Stack</h2>
          <div className="tech-grid">
            <div className="tech-item">
              <h4>Frontend</h4>
              <ul>
                <li>React 18</li>
                <li>React Router</li>
                <li>Modern CSS</li>
                <li>Responsive Design</li>
              </ul>
            </div>
            <div className="tech-item">
              <h4>Backend</h4>
              <ul>
                <li>Express.js</li>
                <li>Node.js</li>
                <li>RESTful API</li>
                <li>Security Middleware</li>
              </ul>
            </div>
            <div className="tech-item">
              <h4>Development</h4>
              <ul>
                <li>Hot Reloading</li>
                <li>ES6+ Features</li>
                <li>Modern Tooling</li>
                <li>Best Practices</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
