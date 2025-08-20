import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DataTable.css';

const DataTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterText, setFilterText] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/users');
      // Ensure data is properly formatted and handle null values
      const userData = response.data.data || [];
      console.log('Raw user data:', userData); // Debug log
      
      const sanitizedData = userData.map(user => ({
        id: user._id || user.id || null,
        name: user.name || '',
        email: user.email || '',
        startSessionTime: user.startSessionTime || null,
        endSessionTime: user.endSessionTime || null,
        createdAt: user.createdAt || null
      }));
      
      console.log('Sanitized data:', sanitizedData); // Debug log
      setData(sanitizedData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data. Please try again.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortedData = () => {
    let filteredData = data.filter(item => {
      // Text filter
      const matchesText = Object.values(item).some(value => {
        // Handle null/undefined values safely
        if (value === null || value === undefined) {
          return false;
        }
        return value.toString().toLowerCase().includes(filterText.toLowerCase());
      });

      // Date filter
      let matchesDate = true;
      if (startDate || endDate) {
        // Only apply date filter if createdAt exists
        if (item.createdAt) {
          const itemDate = new Date(item.createdAt);
          if (startDate && itemDate < new Date(startDate)) {
            matchesDate = false;
          }
          if (endDate && itemDate > new Date(endDate + 'T23:59:59')) {
            matchesDate = false;
          }
        } else {
          // If no createdAt, don't match date filters
          matchesDate = false;
        }
      }

      return matchesText && matchesDate;
    });

    return filteredData.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle null/undefined values in sorting
      if (aValue === null || aValue === undefined) aValue = '';
      if (bValue === null || bValue === undefined) bValue = '';

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const clearFilters = () => {
    setFilterText('');
    setStartDate('');
    setEndDate('');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
          <button onClick={fetchData} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const sortedData = getSortedData();

  return (
    <div className="data-table-container">
      <div className="table-header">
        <h2>Analytics Data</h2>
        <div className="table-controls">
          <div className="filters-section">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search all fields..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>
            <div className="date-filters">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="date-input"
                placeholder="Start Date"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="date-input"
                placeholder="End Date"
              />
              <button onClick={clearFilters} className="btn btn-secondary btn-small">
                Clear Filters
              </button>
            </div>
          </div>
          <div className="table-info">
            <span>Showing {sortedData.length} of {data.length} records</span>
          </div>
        </div>
      </div>

      {sortedData.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>No data found</h3>
          <p>{filterText || startDate || endDate ? 'Try adjusting your filters' : 'No records available'}</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('name')} className="sortable">
                  Name {renderSortIcon('name')}
                </th>
                <th onClick={() => handleSort('email')} className="sortable">
                  Email {renderSortIcon('email')}
                </th>
                <th onClick={() => handleSort('startSessionTime')} className="sortable">
                  Start Session {renderSortIcon('startSessionTime')}
                </th>
                <th onClick={() => handleSort('endSessionTime')} className="sortable">
                  End Session {renderSortIcon('endSessionTime')}
                </th>
                <th onClick={() => handleSort('createdAt')} className="sortable">
                  Created {renderSortIcon('createdAt')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((item) => (
                <tr key={item.id || item._id}>
                  <td>{item.name || 'N/A'}</td>
                  <td>{item.email || 'N/A'}</td>
                  <td>
                    {item.startSessionTime ? new Date(item.startSessionTime).toLocaleString() : 'Not started'}
                  </td>
                  <td>
                    {item.endSessionTime ? new Date(item.endSessionTime).toLocaleString() : 'Active'}
                  </td>
                  <td>
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DataTable;
