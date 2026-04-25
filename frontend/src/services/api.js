import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Events ─────────────────────────────────────────────────────────────────────

export const getAllEvents = () => apiClient.get("/events/");

export const getEvent = (eventId) => apiClient.get(`/events/${eventId}`);

export const createEvent = (eventData) => apiClient.post("/events/", eventData);

export const bookSeat = (eventId, userName) =>
  apiClient.post(`/events/${eventId}/book`, { user_name: userName });

// ── Bookings ───────────────────────────────────────────────────────────────────

export const cancelBooking = (bookingId) =>
  apiClient.delete(`/bookings/${bookingId}`);

export default apiClient;
