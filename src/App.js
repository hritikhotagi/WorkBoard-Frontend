import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import WorkBoard from './components/WorkBoard.jsx';
import CreateBoardPage from './pages/CreateBoardPage';
import { checkTokenValidity, logout } from './api/api';


const ProtectedRoute = ({ element: Component }) => {
  const isAuthenticated = checkTokenValidity(); 

  if (!isAuthenticated) {
    logout(); 
    return <Navigate to="/login" replace />; 
  }

  return <Component />;
};

function App() {
  useEffect(() => {
    if (!checkTokenValidity()) {
      logout(); 
    }
  }, []);

  return (
    <Router> 
      <Routes>
        
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        
        <Route
          path="/"
          element={<ProtectedRoute element={HomePage} />} 
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

        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
