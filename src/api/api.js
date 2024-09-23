import axios from 'axios';

const API_URL = 'http://13.233.255.142';

const removeEmptyFields = (obj) => {
    return Object.fromEntries(
      Object.entries(obj).filter(
        ([_, value]) => value !== null && value !== "" && value !== undefined
      )
    );
  };
  
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

const storeToken = (token) => {
  localStorage.setItem('authToken', token);
};

const getToken = () => {
  return localStorage.getItem('authToken');
};

const removeToken = () => {
  localStorage.removeItem('authToken');
};

const authHeader = () => {
  const token = getToken();
  if (token) {
    return { Authorization: `Bearer ${token}` };
  } else {
    return {};
  }
};

const axiosInstance = axios.create({
  baseURL: API_URL,
});

axiosInstance.interceptors.request.use((config) => {
  config.headers = authHeader();
  return config;
});

const isTokenExpired = (exp) => {
  const currentTime = Date.now() / 1000;
  return exp < currentTime;
};

export const login = async (credentials) => {
  const response = await axios.post(`${API_URL}/auth/login/`, credentials);
  const { access } = response.data;
  storeToken(access);
  return response.data;
};

export const register = async (credentials) => {
  const response = await axios.post(`${API_URL}/api/users/`, credentials);
  return response.data;
};

export const checkTokenValidity = () => {
  const token = getToken();
  if (!token) return false;

  try {
    const { exp } = JSON.parse(atob(token.split('.')[1])); 
    if (isTokenExpired(exp)) {
      removeToken();
      return false;
    }
    return true;
  } catch (e) {
    return false; 
  }
};

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
  const response = await axiosInstance.patch(`api/users/${userId}/`, { role });
  return response.data;
};


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


export const updateTask = async (taskId, updatedTask) => {
  const response = await axiosInstance.patch(`/api/tasks/${taskId}/`, updatedTask);
  return response.data;
};

export const createTask = async (task) => {
  const response = await axiosInstance.post('/api/tasks/', task);
  return response.data;
};

export const updateTaskStatus = async (taskId, data) => {
  const response = await axiosInstance.patch(`/api/tasks/${taskId}/`, data);
  return response.data;
};
