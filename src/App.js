import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import WorkBoard from './components/WorkBoard.jsx';
import CreateBoardPage from './pages/CreateBoardPage';
import { checkTokenValidity, logout } from './api/api';

// A reusable ProtectedRoute component that also verifies user roles if required
const ProtectedRoute = ({ element: Component, allowedRoles }) => {
  const isAuthenticated = checkTokenValidity();
  const storedUser = JSON.parse(localStorage.getItem('user')); 
  const userRole = storedUser ? storedUser.role : null; 

  // If user is not authenticated, redirect to login and logout
  if (!isAuthenticated) {
    logout();
    return <Navigate to="/login" replace />;
  }

  // If the route has role restrictions and user doesn't match, redirect to homepage
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return <Component />;
};

function App() {
  useEffect(() => {
    // Check if the token is still valid on app load and logout if it's expired
    if (!checkTokenValidity()) {
      logout();
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protect all routes, including role-based access */}
        <Route
          path="/"
          element={<ProtectedRoute element={HomePage} />} 
        />
        <Route
          path="/create-board"
          element={<ProtectedRoute element={CreateBoardPage} allowedRoles={['owner']} />} 
        />
        <Route
          path="/admin"
          element={<ProtectedRoute element={AdminPage} allowedRoles={['owner']} />} 
        />
        <Route
          path="/board/:id"
          element={<ProtectedRoute element={WorkBoard} />} 
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
