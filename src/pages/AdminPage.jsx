import React, { useEffect, useState } from 'react';
import AdminUserList from '../components/AdminUserList';
import { getUsers } from '../api/api';
import { Navigate } from 'react-router-dom';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };

    // Fetch user role from localStorage
    const storedRole = localStorage.getItem('userRole');
    setRole(storedRole);

    if (storedRole === 'admin') {
      fetchUsers();
    }
  }, []);

  if (role !== 'admin') {
    return <Navigate to="/" />;
  }

  return (
    <div className="admin-page">
      <h2>User Role Management</h2>
      <AdminUserList users={users} fetchUsers={() => setUsers(users)} />
    </div>
  );
};

export default AdminPage;
