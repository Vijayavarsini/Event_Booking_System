import React, { useState } from 'react';

function CreateEventForm({ onCreateEvent }) {
  const [form, setForm] = useState({ name: '', description: '', total_seats: '', date: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim())                                    { setError('Event name is required.');               return; }
    if (!form.total_seats || parseInt(form.total_seats) <= 0) { setError('Total seats must be a positive number.'); return; }
    if (!form.date)                                           { setError('Event date is required.');               return; }
    onCreateEvent({
      name: form.name.trim(),
      description: form.description.trim() || null,
      total_seats: parseInt(form.total_seats),
      date: form.date.length === 16 ? `${form.date}:00` : form.date,
    });
    setForm({ name: '', description: '', total_seats: '', date: '' });
  };

  return (
    <div className="card">
      <div className="section-header">
        <span className="section-title">Create New Event</span>
      </div>
      <div style={{ padding: '20px 24px 24px' }}>
        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca',
            borderRadius: 6, padding: '10px 14px', marginBottom: 16,
            fontSize: 13, color: '#b91c1c',
          }}>{error}</div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div>
              <label>Event Name *</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Tech Conference 2026" />
            </div>
            <div>
              <label>Total Seats *</label>
              <input type="number" name="total_seats" value={form.total_seats}
                onChange={handleChange} min="1" placeholder="e.g. 50" />
            </div>
            <div>
              <label>Event Date *</label>
              <input type="datetime-local" name="date" value={form.date} onChange={handleChange} />
            </div>
            <div>
              <label>Description</label>
              <input name="description" value={form.description} onChange={handleChange}
                placeholder="Optional short description" />
            </div>
          </div>
          <div style={{ marginTop: 20 }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '9px 24px' }}>
              + Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateEventForm;