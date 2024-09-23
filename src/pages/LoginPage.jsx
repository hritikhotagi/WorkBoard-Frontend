import React, { useState } from 'react';
import { login } from '../api/api'; // Import your login API function
import { useNavigate } from 'react-router-dom';
import '../styles/LoginPage.css'; // Import the CSS for styling

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Basic form validation
  const validateForm = () => {
    if (username === '' || password === '') {
      setErrorMessage('Please fill in all fields.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return; // Perform validation before login
    try {
      const response = await login({ username, password });
      
      // Store the token and user data in localStorage
      localStorage.setItem('authToken', response.access); // Assuming `response.access` is the token
      localStorage.setItem('refreshToken', response.refresh); // Store refresh token
      localStorage.setItem('user', JSON.stringify(response.user)); // Store user data

      navigate('/'); // Redirect to home page after login
    } catch (error) {
      setErrorMessage('Login failed. Please check your credentials.');
    }
  };

  const goToRegister = () => {
    navigate('/register'); // Navigate to the register page
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <p className="login-suggestion">Welcome to the Work Board Application</p>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <form onSubmit={handleSubmit} className="login-form">
        <label>Username</label>
        <input
          type="input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
        <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
        <button type="submit" className="login-btn">Login</button>
      </form>

      {/* Sign Up Section */}
      <div className="signup-section">
        <p>You don't have an account yet? <span onClick={goToRegister} className="signup-link">Sign up</span></p>
      </div>
    </div>
  );
};

export default LoginPage;
