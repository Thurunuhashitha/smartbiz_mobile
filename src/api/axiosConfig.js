import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Same backend URL as used in the web app
// Ensure the backend logic can be hit from standard IPv4 of the host if using an emulator.
// Since it's web and backend we will use localhost or 10.0.2.2 for android.
// If the user's backend is on 5000:
const API = axios.create({
  baseURL: 'http://192.168.8.167:3000', // Host local IP as fallback
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

API.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Same as frontend
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
