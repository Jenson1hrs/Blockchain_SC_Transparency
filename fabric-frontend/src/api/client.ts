import axios from 'axios';
import { API_BASE_URL } from '../config';
import { getToken } from '../utils/authStorage';

export const apiClient = axios.create({ baseURL: API_BASE_URL });

apiClient.interceptors.request.use((config) => {
  const t = getToken();
  if (t) {
    config.headers.Authorization = `Bearer ${t}`;
  }
  return config;
});
