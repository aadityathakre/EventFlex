import React, { useState, useEffect } from 'react';
import { getAuditLogs } from '../../api/admin';
import './AuditLogs.scss';

const AdminAuditLogs = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [actionFilter, setActionFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [actionFilter, searchQuery, logs]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getAuditLogs();

      const data = response.data.data || response.data.logs || [];

      setLogs(data);
      setFilteredLogs(data);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError(err.response?.data?.message || 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = [...logs];

    // Apply action filter
    if (actionFilter !== 'all') {
      filtered = filtered.filter(log => log.action === actionFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(log => {
        const userName = getUserName(log.user);
        const action = log.action || '';
        const entity = log.entity || '';
        const description = log.description || '';

        return (
          userName.toLowerCase().includes(query) ||
          action.toLowerCase().includes(query) ||
          entity.toLowerCase().includes(query) ||
          description.toLowerCase().includes(query)
        );
      });
    }

    setFilteredLogs(filtered);
  };

  const getUserName = (user) => {
    if (!user) return 'System';
    if (typeof user === 'string') return user;
    if (user.name) return user.name;
    if (user.fullName) return user.fullName;
    return `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email || 'Unknown';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getActionBadgeClass = (action) => {
    const actionMap = {
      create: 'action-create',
      update: 'action-update',
      delete: 'action-delete',
      ban: 'action-ban',
      unban: 'action-unban',
      approve: 'action-approve',
      reject: 'action-reject',
      login: 'action-login',
      logout: 'action-logout',
    };
    return actionMap[action?.toLowerCase()] || 'action-default';
  };

  // Get unique actions for filter
  const uniqueActions = [...new Set(logs.map(log => log.action).filter(Boolean))];

  if (loading) {
    return (
      <div className="admin-audit-logs">
        <div className="loading">Loading audit logs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-audit-logs">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="admin-audit-logs">
      <div className="page-header">
        <h1>Audit Logs</h1>
        <p className="subtitle">Track all administrative actions and system events</p>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            className="search-input"
            placeholder="Search logs by user, action, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <select
            className="filter-select"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          >
            <option value="all">All Actions</option>
            {uniqueActions.map(action => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>
        </div>

        <div className="results-info">
          Showing {filteredLogs.length} of {logs.length} logs
        </div>
      </div>

      {/* Logs Table */}
      {filteredLogs.length === 0 ? (
        <div className="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M14 2V8H20M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p>No audit logs found</p>
        </div>
      ) : (
        <div className="logs-table">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Description</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, index) => (
                <tr key={log._id || log.id || index}>
                  <td className="log-timestamp">{formatDate(log.timestamp || log.createdAt)}</td>
                  <td className="log-user">{getUserName(log.user || log.performed_by)}</td>
                  <td>
                    <span className={`action-badge ${getActionBadgeClass(log.action)}`}>
                      {log.action || 'N/A'}
                    </span>
                  </td>
                  <td className="log-entity">{log.entity || log.entity_type || 'N/A'}</td>
                  <td className="log-description">{log.description || log.details || 'N/A'}</td>
                  <td className="log-ip">{log.ip_address || log.ip || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminAuditLogs;
