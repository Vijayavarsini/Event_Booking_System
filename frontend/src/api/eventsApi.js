import axios from 'axios';

const normalizeApiBaseUrl = () => {
  const configured = (process.env.REACT_APP_API_URL || '').trim();
  if (!configured) return 'http://localhost:8000';

  const withProtocol = /^https?:\/\//i.test(configured)
    ? configured
    : `http://${configured}`;

  return withProtocol.replace(/\/+$/, '');
};

const API_BASE_URL = normalizeApiBaseUrl();

export const WS_URL = (() => {
  try {
    const url = new URL(API_BASE_URL);
    const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${url.host}/ws`;
  } catch (_) {
    return 'ws://localhost:8000/ws';
  }
})();
const TOKEN_KEY = 'event_booking_token';
const USERNAME_KEY = 'event_booking_username';

export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);
export const getStoredUsername = () => localStorage.getItem(USERNAME_KEY);
export const isAuthenticated = () => Boolean(getAuthToken());

export const setAuthSession = (token, username) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USERNAME_KEY, username);
};

export const clearAuthSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USERNAME_KEY);
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthSession();
    }
    const message =
      error.response?.data?.detail || error.message || 'An unexpected error occurred.';
    return Promise.reject(new Error(message));
  }
);

export const getAllEvents   = ()                  => apiClient.get('/events/');
export const getEventById  = (eventId)           => apiClient.get(`/events/${eventId}`);
export const createEvent   = (eventData)         => apiClient.post('/events/', eventData);
export const bookEvent     = (eventId, numberOfTickets = 1) =>
  apiClient.post(`/events/${eventId}/book`, { number_of_tickets: numberOfTickets });
export const cancelBooking = (bookingId)         => apiClient.delete(`/bookings/${bookingId}`);
export const getAllBookings = ()                  => apiClient.get('/bookings/');
export const getMyCalendar = ()                   => apiClient.get('/my-calendar');
export const getMyNotifications = ()              => apiClient.get('/notifications/');
export const registerUser  = (payload)           => apiClient.post('/register', payload);
export const loginUser     = (payload)           => apiClient.post('/login', payload);