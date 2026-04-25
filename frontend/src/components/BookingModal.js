import React, { useState, useEffect } from 'react';

function BookingModal({ event, onConfirm, onClose, currentUser }) {
  const [error, setError]       = useState('');
  const [numberOfTickets, setNumberOfTickets] = useState(1);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSubmit = () => {
    if (!currentUser) { setError('Please login to continue.'); return; }
    const parsed = Number(numberOfTickets);
    if (!Number.isInteger(parsed) || parsed < 1) {
      setError('Number of tickets must be at least 1.');
      return;
    }
    if (parsed > event.available_seats) {
      setError(`You can book at most ${event.available_seats} ticket(s) for this event.`);
      return;
    }
    setError('');
    onConfirm(event.id, parsed);
  };

  const pct      = event.total_seats > 0 ? (event.available_seats / event.total_seats) * 100 : 0;
  const barColor = pct === 0 ? '#dc2626' : pct < 30 ? '#d97706' : '#16a34a';

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(15,20,40,.32)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(4px)',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        width: '100%', maxWidth: 420,
        padding: 28,
        boxShadow: '0 20px 52px rgba(30,40,80,.18)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>Confirm Booking</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Press Esc to close</div>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: 'var(--muted)',
            fontSize: 22, cursor: 'pointer', lineHeight: 1, padding: '0 2px',
          }}>×</button>
        </div>

        {/* Event info */}
        <div style={{
          background: 'var(--surface2)', border: '1px solid var(--border)',
          borderRadius: 10, padding: '14px 16px', marginBottom: 20,
        }}>
          <div style={{ fontWeight: 500, color: 'var(--text)', marginBottom: 2 }}>{event.name}</div>
          {event.description && (
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>{event.description}</div>
          )}
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>
            {new Date(event.date).toLocaleString()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: barColor, borderRadius: 2 }} />
            </div>
            <span style={{ fontSize: 12, fontFamily: 'var(--mono)', color: barColor, whiteSpace: 'nowrap' }}>
              {event.available_seats} / {event.total_seats} seats
            </span>
          </div>
        </div>

        {/* Current user */}
        <div style={{ marginBottom: 4 }}>
          <label>Booking As</label>
          <div style={{
            border: '1px solid var(--border)',
            borderRadius: 6,
            padding: '9px 12px',
            color: 'var(--text)',
            background: 'var(--surface2)',
            fontWeight: 500,
          }}>
            {currentUser || 'Not logged in'}
          </div>
        </div>
        {error && (
          <div style={{ fontSize: 12, color: 'var(--danger)', margin: '6px 0 12px' }}>{error}</div>
        )}

        <div style={{ marginTop: 12 }}>
          <label>Number of tickets</label>
          <input
            type="number"
            min={1}
            max={Math.max(1, event.available_seats)}
            value={numberOfTickets}
            onChange={(e) => setNumberOfTickets(e.target.value)}
          />
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
            Available now: {event.available_seats}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>Confirm Booking</button>
        </div>
      </div>
    </div>
  );
}

export default BookingModal;