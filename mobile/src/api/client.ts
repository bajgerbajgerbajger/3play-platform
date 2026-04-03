import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// V dev prostředí použijeme IP adresu tvého počítače
// V produkci to bude URL tvého backendu
const API_URL = 'http://192.168.1.211:3001/api'; 

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor pro přidání JWT tokenu do každého požadavku
client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;
