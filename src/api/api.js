import axios from 'axios';

const API_URL = 'http://13.233.255.142';

const removeEmptyFields = (obj) => {
    return Object.fromEntries(
      Object.entries(obj).filter(
        ([_, value]) => value !== null && value !== "" && value !== undefined
      )
    );
  };
  
  // Recursively clean objects (including arrays)
  const cleanObject = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map(item => cleanObject(item));
    } else if (typeof obj === 'object' && obj !== null) {
      const cleanedObj = removeEmptyFields(obj);
      for (const key in cleanedObj) {
        if (typeof cleanedObj[key] === 'object') {
          cleanedObj[key] = cleanObject(cleanedObj[key]);
        }
      }
      return cleanedObj;
    } else {
      return obj;
    }
  };

// Store the token in localStorage
const storeToken = (token) => {
  localStorage.setItem('authToken', token);
};

// Get the token from localStorage
const getToken = () => {
  return localStorage.getItem('authToken');
};

// Remove the token from localStorage (for logging out)
const removeToken = () => {
  localStorage.removeItem('authToken');
};

// Helper function to add Authorization header with token
const authHeader = () => {
  const token = getToken();
  if (token) {
    return { Authorization: `Bearer ${token}` };
  } else {
    return {};
  }
};

// Axios instance with Authorization header
const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Interceptor to add the token to each request
axiosInstance.interceptors.request.use((config) => {
  config.headers = authHeader();
  return config;
});

// Function to check if the token has expired
const isTokenExpired = (exp) => {
  const currentTime = Date.now() / 1000;
  return exp < currentTime;
};

// Login API
export const login = async (credentials) => {
  const response = await axios.post(`${API_URL}/auth/login/`, credentials);
  const { access } = response.data;
  storeToken(access);
  return response.data;
};

// Register API
export const register = async (credentials) => {
  const response = await axios.post(`${API_URL}/api/users/`, credentials);
  return response.data;
};

// Check token validity on app start
export const checkTokenValidity = () => {
  const token = getToken();
  if (!token) return false;

  try {
    const { exp } = JSON.parse(atob(token.split('.')[1])); // Extract token payload
    if (isTokenExpired(exp)) {
      removeToken(); // Remove token if expired
      return false;
    }
    return true;
  } catch (e) {
    return false; // If there's an issue parsing the token, consider it invalid
  }
};

// Logout user by clearing the token
export const logout = () => {
  removeToken();
};

export const getUserById = async (userId) => {
    const response = await axios.get(`${API_URL}/api/users/${userId}/`);
    return response.data;
};

export const getUsers = async () => {
  const response = await axiosInstance.get('/api/users/');
  return response.data;
};

export const updateUserRole = async (userId, role) => {
  const response = await axiosInstance.patch(`/users/${userId}/`, { role });
  return response.data;
};

// Board APIs
export const getBoards = async () => {
  const response = await axiosInstance.get('/api/boards/');
  return response.data;
};

export const createBoard = async (board) => {    
  const cleanedBoard = cleanObject(board);
  const response = await axiosInstance.post('/api/boards/', cleanedBoard);
  return response.data;
};

export const getBoardDetails = async (boardId) => {
  const response = await axiosInstance.get(`/api/boards/${boardId}/`);
  return response.data;
};

// Task APIs
export const updateTask = async (taskId, updatedTask) => {
  const response = await axiosInstance.patch(`/api/tasks/${taskId}/`, updatedTask);
  return response.data;
};

export const createTask = async (task) => {
  const response = await axiosInstance.post('/api/tasks/', task);
  return response.data;
};

export const updateTaskStatus = async (taskId, status) => {
  const response = await axiosInstance.patch(`/api/tasks/${taskId}/`, { status });
  return response.data;
};
