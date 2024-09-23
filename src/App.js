import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import WorkBoard from './components/WorkBoard.jsx';
import CreateBoardPage from './pages/CreateBoardPage';
import { checkTokenValidity, logout } from './api/api';

// ProtectedRoute component to check for authentication
const ProtectedRoute = ({ element: Component }) => {
  const isAuthenticated = checkTokenValidity(); // Check if the token is valid

  if (!isAuthenticated) {
    logout(); // Log out the user if the token is invalid
    return <Navigate to="/login" replace />; // Redirect to login
  }

  return <Component />;
};

function App() {
  useEffect(() => {
    if (!checkTokenValidity()) {
      logout(); // If the token is invalid or expired, log the user out
    }
  }, []);

  return (
    <Router> {/* Ensure Routes are inside Router */}
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={<ProtectedRoute element={HomePage} />} // HomePage is now protected
        />
        <Route
          path="/create-board"
          element={<ProtectedRoute element={CreateBoardPage} />}
        />
        <Route
          path="/admin"
          element={<ProtectedRoute element={AdminPage} />}
        />
        <Route
          path="/board/:id"
          element={<ProtectedRoute element={WorkBoard} />}
        />

        {/* Redirect to login if the user tries to access unknown routes */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
