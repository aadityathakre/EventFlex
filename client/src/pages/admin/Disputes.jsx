import React, { useState, useEffect } from 'react';
import { getDisputes, resolveDispute } from '../../api/admin';
import './Disputes.scss';

const AdminDisputes = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [disputes, setDisputes] = useState([]);
  const [filteredDisputes, setFilteredDisputes] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    fetchDisputes();
  }, []);

  useEffect(() => {
    filterDisputes();
  }, [statusFilter, disputes]);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getDisputes();

      const data = response.data.data || response.data.disputes || [];

      setDisputes(data);
      setFilteredDisputes(data);
    } catch (err) {
      console.error('Error fetching disputes:', err);
      setError(err.response?.data?.message || 'Failed to fetch disputes');
    } finally {
      setLoading(false);
    }
  };

  const filterDisputes = () => {
    let filtered = [...disputes];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(dispute => dispute.status === statusFilter);
    }

    setFilteredDisputes(filtered);
  };

  const handleViewDetails = (dispute) => {
    setSelectedDispute(dispute);
    setResolutionNotes('');
  };

  const handleCloseModal = () => {
    setSelectedDispute(null);
    setResolutionNotes('');
  };

  const handleResolve = async () => {
    if (!resolutionNotes.trim()) {
      alert('Please enter resolution notes');
      return;
    }

    if (!window.confirm('Are you sure you want to resolve this dispute?')) return;

    try {
      setResolving(true);
      await resolveDispute(selectedDispute._id || selectedDispute.id, {
        resolution_notes: resolutionNotes,
      });

      alert('Dispute resolved successfully');
      fetchDisputes();
      handleCloseModal();
    } catch (err) {
      console.error('Error resolving dispute:', err);
      alert(err.response?.data?.message || 'Failed to resolve dispute');
    } finally {
      setResolving(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      open: 'status-open',
      pending: 'status-pending',
      resolved: 'status-resolved',
      closed: 'status-closed',
    };
    return statusMap[status] || 'status-pending';
  };

  if (loading) {
    return (
      <div className="admin-disputes">
        <div className="loading">Loading disputes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-disputes">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="admin-disputes">
      <div className="page-header">
        <h1>Dispute Management</h1>
        <p className="subtitle">Review and resolve disputes raised by users</p>
      </div>

      {/* Filter Controls */}
      <div className="filters-section">
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>

        <div className="results-info">
          Showing {filteredDisputes.length} of {disputes.length} disputes
        </div>
      </div>

      {/* Disputes List */}
      {filteredDisputes.length === 0 ? (
        <div className="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 8V12" stroke="currentColor" strokeWidth="2"/>
            <circle cx="12" cy="16" r="0.5" fill="currentColor" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
          <p>No disputes found</p>
        </div>
      ) : (
        <div className="disputes-grid">
          {filteredDisputes.map((dispute) => (
            <div key={dispute._id || dispute.id} className="dispute-card">
              <div className="dispute-header">
                <span className={`status-badge ${getStatusBadgeClass(dispute.status)}`}>
                  {dispute.status || 'pending'}
                </span>
                <span className="dispute-date">{formatDate(dispute.createdAt || dispute.created_at)}</span>
              </div>

              <div className="dispute-content">
                <h3>{dispute.event?.title || 'Dispute'}</h3>
                <p className="dispute-description">
                  {dispute.reason || 'No reason provided'}
                </p>

                <div className="dispute-details">
                  <div className="detail-item">
                    <span className="label">Raised by:</span>
                    <span className="value">
                      {dispute.raised_by?.fullName || dispute.raised_by?.email || 'N/A'}
                    </span>
                  </div>
                  {dispute.event && (
                    <div className="detail-item">
                      <span className="label">Event:</span>
                      <span className="value">{dispute.event.title}</span>
                    </div>
                  )}
                  {dispute.against && (
                    <div className="detail-item">
                      <span className="label">Against:</span>
                      <span className="value">
                        {dispute.against.fullName || dispute.against.email || 'N/A'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="dispute-actions">
                <button
                  className="btn-view-details"
                  onClick={() => handleViewDetails(dispute)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dispute Details Modal */}
      {selectedDispute && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Dispute Details</h2>
              <button className="btn-close" onClick={handleCloseModal}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <div className="dispute-info">
                <div className="info-row">
                  <span className="label">Status:</span>
                  <span className={`status-badge ${getStatusBadgeClass(selectedDispute.status)}`}>
                    {selectedDispute.status || 'pending'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Raised by:</span>
                  <span className="value">
                    {selectedDispute.raised_by?.fullName || selectedDispute.raised_by?.email || 'N/A'}
                  </span>
                </div>
                {selectedDispute.against && (
                  <div className="info-row">
                    <span className="label">Against:</span>
                    <span className="value">
                      {selectedDispute.against?.fullName || selectedDispute.against?.email || 'N/A'}
                    </span>
                  </div>
                )}
                <div className="info-row">
                  <span className="label">Created:</span>
                  <span className="value">
                    {formatDate(selectedDispute.createdAt || selectedDispute.created_at)}
                  </span>
                </div>
                {selectedDispute.event && (
                  <div className="info-row">
                    <span className="label">Event:</span>
                    <span className="value">{selectedDispute.event.title}</span>
                  </div>
                )}
              </div>

              <div className="dispute-description-section">
                <h3>Reason</h3>
                <p>{selectedDispute.reason || 'No reason provided'}</p>
              </div>

              {selectedDispute.status !== 'resolved' && selectedDispute.status !== 'closed' && (
                <div className="resolution-section">
                  <h3>Resolution Notes</h3>
                  <textarea
                    className="resolution-textarea"
                    placeholder="Enter resolution notes..."
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    rows={5}
                  />
                </div>
              )}

              {selectedDispute.resolution_notes && (
                <div className="resolution-section">
                  <h3>Resolution Notes</h3>
                  <p>{selectedDispute.resolution_notes}</p>
                </div>
              )}
            </div>

            {selectedDispute.status !== 'resolved' && selectedDispute.status !== 'closed' && (
              <div className="modal-footer">
                <button className="btn-cancel" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button
                  className="btn-resolve"
                  onClick={handleResolve}
                  disabled={resolving}
                >
                  {resolving ? 'Resolving...' : 'Mark as Resolved'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDisputes;
