import React, { useState, useEffect } from 'react';
import { getPendingKYC, approveKYC, rejectKYC, getUserDocuments } from '../../api/admin';
import './KYC.scss';

const AdminKYC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingKYCs, setPendingKYCs] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [documents, setDocuments] = useState(null);
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  useEffect(() => {
    fetchPendingKYC();
  }, []);

  const fetchPendingKYC = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getPendingKYC();

      const data = response.data.data || response.data.pendingKYCs || [];

      setPendingKYCs(data);
    } catch (err) {
      console.error('Error fetching pending KYC:', err);
      setError(err.response?.data?.message || 'Failed to fetch pending KYC requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDocuments = async (userId) => {
    try {
      setLoadingDocuments(true);
      const response = await getUserDocuments(userId);

      const data = response.data.data || response.data;

      setDocuments(data);
    } catch (err) {
      console.error('Error fetching documents:', err);
      alert(err.response?.data?.message || 'Failed to fetch user documents');
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleViewDocuments = (user) => {
    setSelectedUser(user);
    fetchUserDocuments(user._id || user.id);
  };

  const handleCloseDocuments = () => {
    setSelectedUser(null);
    setDocuments(null);
  };

  const handleApprove = async (userId) => {
    if (!window.confirm('Are you sure you want to approve this KYC request?')) return;

    try {
      await approveKYC(userId);
      alert('KYC approved successfully');
      fetchPendingKYC();
      handleCloseDocuments();
    } catch (err) {
      console.error('Error approving KYC:', err);
      alert(err.response?.data?.message || 'Failed to approve KYC');
    }
  };

  const handleReject = async (userId) => {
    if (!window.confirm('Are you sure you want to reject this KYC request?')) return;

    try {
      await rejectKYC(userId);
      alert('KYC rejected successfully');
      fetchPendingKYC();
      handleCloseDocuments();
    } catch (err) {
      console.error('Error rejecting KYC:', err);
      alert(err.response?.data?.message || 'Failed to reject KYC');
    }
  };

  const getUserName = (user) => {
    if (user.name) return user.name;
    if (user.fullName) return user.fullName;
    return `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'N/A';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="admin-kyc">
        <div className="loading">Loading pending KYC requests...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-kyc">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="admin-kyc">
      <div className="page-header">
        <h1>KYC Management</h1>
        <p className="subtitle">Review and approve pending KYC verification requests</p>
      </div>

      <div className="kyc-stats">
        <div className="stat-item">
          <span className="stat-value">{pendingKYCs.length}</span>
          <span className="stat-label">Pending Requests</span>
        </div>
      </div>

      {pendingKYCs.length === 0 ? (
        <div className="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <p>No pending KYC requests</p>
        </div>
      ) : (
        <div className="kyc-grid">
          {pendingKYCs.map((user) => (
            <div key={user._id || user.id} className="kyc-card">
              <div className="kyc-header">
                <div className="user-info">
                  <h3>{getUserName(user)}</h3>
                  <p className="user-email">{user.email || 'N/A'}</p>
                </div>
                <span className={`role-badge role-${user.role}`}>
                  {user.role?.toUpperCase() || 'N/A'}
                </span>
              </div>

              <div className="kyc-details">
                <div className="detail-item">
                  <span className="detail-label">Phone:</span>
                  <span className="detail-value">{user.phone || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Submitted:</span>
                  <span className="detail-value">{formatDate(user.createdAt || user.kyc_submitted_at)}</span>
                </div>
              </div>

              <div className="kyc-actions">
                <button
                  className="btn-view"
                  onClick={() => handleViewDocuments(user)}
                >
                  View Documents
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Documents Modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={handleCloseDocuments}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>KYC Documents - {getUserName(selectedUser)}</h2>
              <button className="btn-close" onClick={handleCloseDocuments}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <div className="modal-body">
              {loadingDocuments ? (
                <div className="loading">Loading documents...</div>
              ) : documents ? (
                <div className="documents-container">
                  <div className="user-details">
                    <div className="detail-row">
                      <span className="label">Email:</span>
                      <span className="value">{selectedUser.email || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Phone:</span>
                      <span className="value">{selectedUser.phone || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Role:</span>
                      <span className="value">{selectedUser.role?.toUpperCase() || 'N/A'}</span>
                    </div>
                  </div>

                  {documents.documents && documents.documents.length > 0 ? (
                    <div className="documents-list">
                      <h3>Uploaded Documents</h3>
                      {documents.documents.map((doc, index) => (
                        <div key={index} className="document-item">
                          <div className="document-info">
                            <span className="document-type">{doc.type || `Document ${index + 1}`}</span>
                            <span className="document-name">{doc.name || doc.url || 'N/A'}</span>
                          </div>
                          {doc.url && (
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-view-doc"
                            >
                              View
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-documents">No documents uploaded</div>
                  )}
                </div>
              ) : (
                <div className="error">Failed to load documents</div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="btn-reject"
                onClick={() => handleReject(selectedUser._id || selectedUser.id)}
                disabled={loadingDocuments}
              >
                Reject KYC
              </button>
              <button
                className="btn-approve"
                onClick={() => handleApprove(selectedUser._id || selectedUser.id)}
                disabled={loadingDocuments}
              >
                Approve KYC
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminKYC;
