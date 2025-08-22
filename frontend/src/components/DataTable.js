import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './DataTable.css';

const DataTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterText, setFilterText] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortField, setSortField] = useState('queueJoinTime');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const wsRef = useRef(null);

  useEffect(() => {
    fetchData();
    
    const wsUrl = `ws://${window.location.hostname}:${window.location.port === '3000' ? '5000' : window.location.port}`;
    wsRef.current = new WebSocket(wsUrl);
    
    wsRef.current.onopen = () => {
      console.log('WebSocket connected for real-time updates');
    };
    
    wsRef.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'database_change') {
          console.log('Database change detected:', message);
          fetchData();
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

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/users');
      const userData = response.data.data || [];
      console.log('Raw user data:', userData);
      
      const sanitizedData = userData.map(user => ({
        id: user._id || user.id || null,
        email: user.email || '',
        startTime: user.startTime || null,
        endTime: user.endTime || null,
        queueJoinTime: user.queueJoinTime || null
      }));
      
      console.log('Sanitized data:', sanitizedData);
      setData(sanitizedData);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
        setError('Cannot connect to server. Please check if the backend is running.');
      } else if (err.response?.status === 500) {
        setError('Server error occurred. Please try again later.');
      } else {
        setError('Failed to fetch data. Please try again.');
      }
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
      const matchesText = Object.values(item).some(value => {
        if (value === null || value === undefined) {
          return false;
        }
        return value.toString().toLowerCase().includes(filterText.toLowerCase());
      });

                   let matchesDate = true;
             if (startDate || endDate) {
               if (item.startTime) {
                 const itemDate = new Date(item.startTime);
                 if (startDate && itemDate < new Date(startDate)) {
                   matchesDate = false;
                 }
                 if (endDate && itemDate > new Date(endDate + 'T23:59:59')) {
                   matchesDate = false;
                 }
               } else {
                 matchesDate = false;
               }
             }

      return matchesText && matchesDate;
    });

    return filteredData.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

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
    setCurrentPage(1);
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
         const totalPages = Math.ceil(sortedData.length / itemsPerPage);
         const startIndex = (currentPage - 1) * itemsPerPage;
         const endIndex = startIndex + itemsPerPage;
         const currentData = sortedData.slice(startIndex, endIndex);

         const handlePageChange = (page) => {
           setCurrentPage(page);
         };

         return (
    <div className="data-table-container">
      <div className="table-header">
        <div className="header-left">
          <h2>Analytics Data</h2>
          <div className="realtime-indicator">
            <span className="indicator-dot"></span>
            <span className="indicator-text">Real-time updates active</span>
          </div>
        </div>
        <div className="table-controls">
          <div className="filters-section">
            <div className="search-box">
                               <input
                   type="text"
                   placeholder="Search all fields..."
                   value={filterText}
                   onChange={(e) => {
                     setFilterText(e.target.value);
                     setCurrentPage(1);
                   }}
                   className="search-input"
                 />
              <span className="search-icon">🔍</span>
            </div>
            <div className="date-filters">
                             <input
                 type="date"
                 value={startDate}
                 onChange={(e) => {
                   setStartDate(e.target.value);
                   setCurrentPage(1);
                 }}
                 className="date-input"
                 placeholder="Start Date"
               />
               <input
                 type="date"
                 value={endDate}
                 onChange={(e) => {
                   setEndDate(e.target.value);
                   setCurrentPage(1);
                 }}
                 className="date-input"
                 placeholder="End Date"
               />
              <button onClick={clearFilters} className="btn btn-secondary btn-small">
                Clear Filters
              </button>
            </div>
          </div>
                           <div className="table-info">
                   <span>Showing {startIndex + 1}-{Math.min(endIndex, sortedData.length)} of {sortedData.length} records</span>
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
                     <th onClick={() => handleSort('email')} className="sortable">
                       Email {renderSortIcon('email')}
                     </th>
                     <th onClick={() => handleSort('queueJoinTime')} className="sortable">
                       Queue Join Time {renderSortIcon('queueJoinTime')}
                     </th>
                <th onClick={() => handleSort('startTime')} className="sortable">
                  Start Time {renderSortIcon('startTime')}
                </th>
                                 <th onClick={() => handleSort('endTime')} className="sortable">
                   End Time {renderSortIcon('endTime')}
                 </th>
              </tr>
            </thead>
                               <tbody>
                     {currentData.map((item) => (
                       <tr key={item.id || item._id}>
                         <td>{item.email || 'N/A'}</td>
                         <td>
                           {item.queueJoinTime ? new Date(item.queueJoinTime).toLocaleString() : 'Not joined'}
                         </td>
                  <td>
                    {item.startTime ? new Date(item.startTime).toLocaleString() : 'Not started'}
                  </td>
                                     <td>
                     {item.endTime ? new Date(item.endTime).toLocaleString() : ''}
                   </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => handlePageChange(currentPage - 1)} 
            disabled={currentPage === 1}
            className="btn btn-secondary btn-small"
          >
            Previous
          </button>
          
          <div className="page-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`btn btn-small ${currentPage === page ? 'btn-primary' : 'btn-secondary'}`}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => handlePageChange(currentPage + 1)} 
            disabled={currentPage === totalPages}
            className="btn btn-secondary btn-small"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default DataTable;
