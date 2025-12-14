import React, { useState, useEffect } from 'react';
import { getAllRoles, banUser, unbanUser, softDeleteUser, restoreUser } from '../../api/admin';
import './Users.scss';

const AdminUsers = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, roleFilter, statusFilter, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getAllRoles();

      const data = response.data.data || response.data;

      // Transform users data - it might be an object with role keys or an array
      let allUsers = [];

      if (Array.isArray(data)) {
        allUsers = data;
      } else if (typeof data === 'object') {
        // If data is an object with roles as keys
        Object.keys(data).forEach(role => {
          if (Array.isArray(data[role])) {
            allUsers = [...allUsers, ...data[role].map(user => ({ ...user, role }))];
          }
        });
      }

      setUsers(allUsers);
      setFilteredUsers(allUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        filtered = filtered.filter(user => !user.is_banned && !user.is_deleted);
      } else if (statusFilter === 'banned') {
        filtered = filtered.filter(user => user.is_banned);
      } else if (statusFilter === 'deleted') {
        filtered = filtered.filter(user => user.is_deleted);
      }
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => {
        const name = user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim();
        const email = user.email || '';
        const phone = user.phone || '';

        return (
          name.toLowerCase().includes(query) ||
          email.toLowerCase().includes(query) ||
          phone.includes(query)
        );
      });
    }

    setFilteredUsers(filtered);
  };

  const handleBanUser = async (userId) => {
    if (!window.confirm('Are you sure you want to ban this user?')) return;

    try {
      await banUser(userId);
      alert('User banned successfully');
      fetchUsers();
    } catch (err) {
      console.error('Error banning user:', err);
      alert(err.response?.data?.message || 'Failed to ban user');
    }
  };

  const handleUnbanUser = async (userId) => {
    if (!window.confirm('Are you sure you want to unban this user?')) return;

    try {
      await unbanUser(userId);
      alert('User unbanned successfully');
      fetchUsers();
    } catch (err) {
      console.error('Error unbanning user:', err);
      alert(err.response?.data?.message || 'Failed to unban user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This can be reversed.')) return;

    try {
      await softDeleteUser(userId);
      alert('User deleted successfully');
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleRestoreUser = async (userId) => {
    if (!window.confirm('Are you sure you want to restore this user?')) return;

    try {
      await restoreUser(userId);
      alert('User restored successfully');
      fetchUsers();
    } catch (err) {
      console.error('Error restoring user:', err);
      alert(err.response?.data?.message || 'Failed to restore user');
    }
  };

  const getUserName = (user) => {
    if (user.name) return user.name;
    if (user.fullName) return user.fullName;
    return `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'N/A';
  };

  const getUserStatus = (user) => {
    if (user.is_deleted) return 'deleted';
    if (user.is_banned) return 'banned';
    return 'active';
  };

  if (loading) {
    return (
      <div className="admin-users">
        <div className="loading">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-users">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="admin-users">
      <div className="page-header">
        <h1>User Management</h1>
        <p className="subtitle">Manage all users across the platform</p>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <select
            className="filter-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="host">Hosts</option>
            <option value="organizer">Organizers</option>
            <option value="gig">Gig Workers</option>
          </select>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="banned">Banned</option>
            <option value="deleted">Deleted</option>
          </select>
        </div>
      </div>

      {/* User Count */}
      <div className="results-info">
        Showing {filteredUsers.length} of {users.length} users
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div className="empty-state">No users found</div>
      ) : (
        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>KYC</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id || user.id}>
                  <td className="user-name">{getUserName(user)}</td>
                  <td>{user.email || 'N/A'}</td>
                  <td>{user.phone || 'N/A'}</td>
                  <td>
                    <span className={`role-badge role-${user.role}`}>
                      {user.role?.toUpperCase() || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge status-${getUserStatus(user)}`}>
                      {getUserStatus(user)}
                    </span>
                  </td>
                  <td>
                    <span className={`kyc-badge kyc-${user.kyc_status || 'pending'}`}>
                      {user.kyc_status || 'pending'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {getUserStatus(user) === 'active' && (
                        <>
                          <button
                            className="btn-action btn-ban"
                            onClick={() => handleBanUser(user._id || user.id)}
                          >
                            Ban
                          </button>
                          <button
                            className="btn-action btn-delete"
                            onClick={() => handleDeleteUser(user._id || user.id)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                      {getUserStatus(user) === 'banned' && (
                        <button
                          className="btn-action btn-unban"
                          onClick={() => handleUnbanUser(user._id || user.id)}
                        >
                          Unban
                        </button>
                      )}
                      {getUserStatus(user) === 'deleted' && (
                        <button
                          className="btn-action btn-restore"
                          onClick={() => handleRestoreUser(user._id || user.id)}
                        >
                          Restore
                        </button>
                      )}
                    </div>
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

export default AdminUsers;
