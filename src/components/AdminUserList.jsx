import React, { useState } from 'react';
import { updateUserRole } from '../api/api';

const AdminUserList = ({ users, fetchUsers }) => {
  const [loading, setLoading] = useState(false);

  const handleRoleChange = async (userId, newRole) => {
    setLoading(true);
    await updateUserRole(userId, newRole);
    setLoading(false);
    fetchUsers(); // Re-fetch users after role change
  };

  return (
    <div className="admin-user-list">
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Current Role</th>
            <th>Change Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <select
                  defaultValue={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  disabled={loading}
                >
                  <option value="owner">Owner</option>
                  <option value="collaborator">Collaborator</option>
                  <option value="viewer">Viewer</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUserList;
