import { useState, useEffect } from 'react';
import { getAllUsers } from '../services/api';
import UserModal from './UserModal';
import Pagination from './Pagination';
import './Users.css';

// Page size options
const PAGE_SIZE_OPTIONS = [5, 10, 20];

function Users() {
  // Users state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  // Users pagination state
  const [usersPage, setUsersPage] = useState(1);
  const [usersLimit, setUsersLimit] = useState(10);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [usersTotal, setUsersTotal] = useState(0);
  
  // Expanded User Modal state
  const [expandedUser, setExpandedUser] = useState(null);

  // Fetch all users with optional role filter and pagination
  const fetchUsers = async (fetchPage = usersPage, fetchLimit = usersLimit, fetchRoleFilter = roleFilter) => {
    setUsersLoading(true);
    setUsersError('');
    
    try {
      const response = await getAllUsers(fetchPage, fetchLimit, fetchRoleFilter);
      setUsers(response.users || []);
      setUsersTotal(response.pagination?.total || response.users?.length || 0);
      setUsersTotalPages(response.pagination?.totalPages || 1);
    } catch (err) {
      console.error('Error fetching users:', err);
      setUsersError('Failed to fetch users. Please try again.');
    } finally {
      setUsersLoading(false);
    }
  };

  // Fetch users on mount and when filters/pagination change
  useEffect(() => {
    fetchUsers();
  }, [roleFilter, usersPage, usersLimit]);

  // Handle role filter change
  const handleRoleFilterChange = (newRole) => {
    setRoleFilter(newRole);
    setUsersPage(1); // Reset to first page when changing filter
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle users page change
  const handleUsersPageChange = (newPage) => {
    setUsersPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle users page size change
  const handleUsersLimitChange = (newLimit) => {
    setUsersLimit(newLimit);
    setUsersPage(1); // Reset to first page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="content-section">
      <div className="users-header">
        <h2>User Management</h2>
        <div className="header-actions">
          <div className="role-filters">
            <button
              className={`status-filter-btn ${roleFilter === 'all' ? 'active' : ''}`}
              onClick={() => handleRoleFilterChange('all')}
            >
              All
            </button>
            <button
              className={`status-filter-btn ${roleFilter === 'admin' ? 'active' : ''}`}
              onClick={() => handleRoleFilterChange('admin')}
            >
              Admin
            </button>
            <button
              className={`status-filter-btn ${roleFilter === 'seller' ? 'active' : ''}`}
              onClick={() => handleRoleFilterChange('seller')}
            >
              Seller
            </button>
            <button
              className={`status-filter-btn ${roleFilter === 'buyer' ? 'active' : ''}`}
              onClick={() => handleRoleFilterChange('buyer')}
            >
              Buyer
            </button>
          </div>
        </div>
      </div>

      {usersError && <div className="error-message">{usersError}</div>}

      {usersLoading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="no-users">
          <p>No users found.</p>
        </div>
      ) : (
        <>
          {/* Results Info and Page Size Selector */}
          {users.length > 0 && (
            <div className="results-header">
              <div className="results-count">
                {usersTotal} user{usersTotal !== 1 ? 's' : ''} found
                <span className="total-count"> (showing {users.length} of {usersTotal})</span>
              </div>
              
              <div className="page-size-selector">
                <label htmlFor="users-page-size">Show:</label>
                <select
                  id="users-page-size"
                  value={usersLimit}
                  onChange={(e) => handleUsersLimitChange(Number(e.target.value))}
                  className="filter-select"
                >
                  {PAGE_SIZE_OPTIONS.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
          
          <div className="admin-users-table">
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr 
                    key={user._id} 
                    className="user-row"
                    onClick={() => setExpandedUser(user)}
                  >
                    <td>
                      <div className="user-name-cell">
                        <span className="user-name">{user.name}</span>
                        {user.businessName && (
                          <span className="user-business">{user.businessName}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`role-badge-cell role-${user.role}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>{user.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {usersTotalPages > 1 && (
            <Pagination
              currentPage={usersPage}
              totalPages={usersTotalPages}
              onPageChange={handleUsersPageChange}
            />
          )}
        </>
      )}

      {/* Expanded User Modal */}
      {expandedUser && (
        <UserModal
          user={expandedUser}
          onClose={() => setExpandedUser(null)}
          onUserUpdated={(updatedUser) => {
            // Refresh users list after update
            fetchUsers();
            setExpandedUser(null);
          }}
        />
      )}
    </div>
  );
}

export default Users;

