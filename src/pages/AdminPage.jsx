import React, { useState, useEffect } from 'react';
import { getUsers, updateUserRole } from '../api/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/AdminPage.css'; 

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [loggedInUserId, setLoggedInUserId] = useState(null); // Track logged-in user ID

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await getUsers();
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    // Fetch the logged-in user from local storage
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setLoggedInUserId(storedUser.id);
    }

    fetchUsers();
  }, []);

  const handleEditRole = (userId, currentRole) => {
    setEditingUserId(userId);
    setSelectedRole(currentRole);
  };

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
  };

  const handleSaveRole = async (userId) => {
    try {
      await updateUserRole(userId, selectedRole);
      const updatedUsers = users.map((user) =>
        user.id === userId ? { ...user, role: selectedRole } : user
      );
      setUsers(updatedUsers);
      setEditingUserId(null);
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  return (
    <div className="admin-page container mt-5">
      <h2 className="text-center mb-4">Admin Panel - Manage User Roles</h2>
      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="thead-dark">
            <tr>
              <th>Username</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>
                  {editingUserId === user.id ? (
                    <select
                      className="form-control"
                      value={selectedRole}
                      onChange={handleRoleChange}
                    >
                      <option value="owner">Owner</option>
                      <option value="collaborator">Collaborator</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  ) : (
                    user.role
                  )}
                </td>
                <td>
                  {/* Disable Edit Role for logged-in user */}
                  {loggedInUserId === user.id ? (
                    <button className="btn btn-secondary" disabled>
                      Cannot Edit Self
                    </button>
                  ) : editingUserId === user.id ? (
                    <button
                      className="btn btn-success"
                      onClick={() => handleSaveRole(user.id)}
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      className="btn edit-role-btn"
                      onClick={() => handleEditRole(user.id, user.role)}
                    >
                      Edit Role
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPage;
