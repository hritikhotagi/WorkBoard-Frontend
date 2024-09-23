import React, { useState } from 'react';
import { register } from '../api/api'; 
import { useNavigate } from 'react-router-dom';
import '../styles/RegisterPage.css'; 

const RegisterPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('collaborator'); 
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register({ username, email, password, role });
      navigate('/login'); 
    } catch (error) {
      setErrorMessage('Registration failed.');
    }
  };

  const goToLogin = () => {
    navigate('/login'); 
  };

  return (
    <div className="register-page">
      <h2>Register</h2>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="owner">Owner</option>
          <option value="collaborator">Collaborator</option>
          <option value="viewer">Viewer</option>
        </select>
        <button type="submit">Register</button>
      </form>

      
      <div className="login-section">
        <p>Already have an account? <span onClick={goToLogin} className="login-link">Login</span></p>
      </div>
    </div>
  );
};

export default RegisterPage;
