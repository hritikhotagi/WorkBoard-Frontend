import React, { useState, useEffect } from 'react';
import BoardList from '../components/BoardList';
import { useNavigate } from 'react-router-dom';
import { getBoards } from '../api/api'; // Import your getBoards API function
import '../styles/HomePage.css';

const HomePage = () => {
  const [boards, setBoards] = useState([]); // Now fetching dynamic data
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null); // New state for user object

  const navigate = useNavigate();

  useEffect(() => {
    // Check for the auth token and user data in localStorage
    const token = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user'); // Fetch user object from localStorage

    if (token && storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser)); // Parse the stored user data and set it in state
    } else {
      setIsAuthenticated(false);
    }

    // Fetch boards from the API
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
    // Clear auth token and user data from localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    navigate('/login'); // Redirect to login page
  };

  // Function to get the initial letter from the username
  const getInitial = (name) => {
    return name.charAt(0).toUpperCase(); // Get the first letter and convert to uppercase
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
                {/* Display the initial if no profile picture is provided */}
                <span className="profile-initials">{getInitial(user.username)}</span>
              </div>
              <span className="profile-name">{user.username}</span> {/* Display the username */}
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
