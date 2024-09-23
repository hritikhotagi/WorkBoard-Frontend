import React, { useState, useEffect } from 'react';
import BoardList from '../components/BoardList';
import { useNavigate } from 'react-router-dom';
import { getBoards } from '../api/api'; 
import '../styles/HomePage.css';

const HomePage = () => {
  const [boards, setBoards] = useState([]); 
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null); 

  const navigate = useNavigate();

  useEffect(() => {
    
    const token = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user'); 

    if (token && storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser)); 
    } else {
      setIsAuthenticated(false);
    }

    
    const fetchBoards = async () => {
      try {
        const boardsData = await getBoards();
        setBoards(boardsData);
      } catch (error) {
        console.error('Error fetching boards:', error);
      }
    };

    fetchBoards();
  }, []);

  const handleLogout = () => {
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    navigate('/login'); 
  };

  
  const getInitial = (name) => {
    return name.charAt(0).toUpperCase(); 
  };

  return (
    <div className="home-page">
      <nav className="navbar">
        <div className="navbar-title">
          <h2>My WorkBoards</h2>
          <span className="navbar-subtitle">Assigned to Me</span>
        </div>
        <div className="navbar-profile">
          {isAuthenticated && user ? (
            <>
              <div className="profile-icon">
                
                <span className="profile-initials">{getInitial(user.username)}</span>
              </div>
              <span className="profile-name">{user.username}</span> 
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button className="auth-btn" onClick={() => navigate('/login')}>
                Sign In
              </button>
              <button className="auth-btn" onClick={() => navigate('/register')}>
                Sign Up
              </button>
            </>
          )}
        </div>
      </nav>

      <div className="board-list-container">
        <BoardList boards={boards} />
      </div>
    </div>
  );
};

export default HomePage;
