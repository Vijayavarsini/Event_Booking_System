import React, { useState } from "react";
import { bookSeat } from "../services/api";

function BookingForm({ eventId, eventName, onBooked }) {
  const [userName, setUserName] = useState("");
  const [message, setMessage] = useState(null);
  const [isError, setIsError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userName.trim()) {
      setMessage("Please enter your name.");
      setIsError(true);
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      const response = await bookSeat(eventId, userName.trim());
      setMessage(
        `✓ Booking confirmed! ID: ${response.data.id} for ${response.data.user_name}`
      );
      setIsError(false);
      setUserName("");
      if (onBooked) onBooked(response.data);
    } catch (err) {
      const detail =
        err.response?.data?.detail || "Booking failed. Please try again.";
      setMessage(`✗ ${detail}`);
      setIsError(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <strong>Book seat for: {eventName}</strong>
      <form onSubmit={handleSubmit} style={{ marginTop: "8px" }}>
        <input
          type="text"
          placeholder="Your name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          disabled={submitting}
          style={{ padding: "6px", marginRight: "8px", width: "200px" }}
        />
        <button type="submit" disabled={submitting} style={{ padding: "6px 14px" }}>
          {submitting ? "Booking..." : "Confirm Booking"}
        </button>
      </form>
      {message && (
        <p style={{ marginTop: "6px", color: isError ? "red" : "green" }}>
          {message}
        </p>
      )}
    </div>
  );
}

export default BookingForm;
