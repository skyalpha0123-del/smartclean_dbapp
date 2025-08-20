import React from 'react';
import './InfoSection.css';

const InfoSection = () => {
  return (
    <div className="info-section">
      <div className="info-container">
        <div className="info-header">
          <div className="logo-container">
            <img src="/sc_logo.webp" alt="SmartClean Logo" className="company-logo" />
          </div>
          <div className="company-info">
            <h1 className="company-name">SmartClean</h1>
            <p className="company-description">Professional Cleaning Services</p>
            <div className="company-details">
              <div className="detail-item">
                <span className="detail-label">Established:</span>
                <span className="detail-value">2020</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Services:</span>
                <span className="detail-value">Residential & Commercial</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Coverage:</span>
                <span className="detail-value">Greater Stockholm Area</span>
              </div>
            </div>
          </div>
        </div>
        <div className="info-stats">
          <div className="stat-item">
            <div className="stat-number">500+</div>
            <div className="stat-label">Happy Clients</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">1000+</div>
            <div className="stat-label">Cleanings Completed</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">4.9</div>
            <div className="stat-label">Customer Rating</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoSection;
