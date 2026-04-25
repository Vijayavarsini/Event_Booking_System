import React from 'react';

function SeatBar({ available, total }) {
  const pct   = total > 0 ? (available / total) * 100 : 0;
  const color = pct === 0 ? '#dc2626' : pct < 30 ? '#d97706' : '#16a34a';
  return (
    <div className="seat-bar-wrap">
      <span style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 500, color, minWidth: 28 }}>
        {available}
      </span>
      <div className="seat-bar-bg">
        <div className="seat-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span style={{ fontSize: 11, color: 'var(--muted)', minWidth: 28, textAlign: 'right' }}>
        {total}
      </span>
    </div>
  );
}

function EventList({ events, onBook, loading }) {
  return (
    <div className="card">
      <div className="section-header">
        <span className="section-title">Available Events</span>
        <span className="badge badge-neutral">{events.length} events</span>
      </div>

      {loading ? (
        <div style={{ padding: '44px', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
          Loading events…
        </div>
      ) : events.length === 0 ? (
        <div style={{ padding: '44px', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
          No events yet. Create one below.
        </div>
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th style={{ width: 48 }}>#</th>
                <th>Name</th>
                <th>Description</th>
                <th>Date</th>
                <th>Seats</th>
                <th>Status</th>
                <th style={{ width: 90 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => {
                const started = new Date(event.date) <= new Date();
                const booked = event.available_seats === 0;
                const statusText = started ? 'Started' : booked ? 'Full' : 'Open';
                const statusClass = started ? 'badge-neutral' : booked ? 'badge-danger' : 'badge-success';
                return (
                  <tr key={event.id}>
                    <td>
                      <span style={{ fontFamily: 'var(--mono)', color: 'var(--muted)', fontSize: 12 }}>
                        {event.id}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{event.name}</td>
                    <td style={{ color: 'var(--muted)', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {event.description || '—'}
                    </td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                      {new Date(event.date).toLocaleString()}
                    </td>
                    <td style={{ minWidth: 160 }}>
                      <SeatBar available={event.available_seats} total={event.total_seats} />
                    </td>
                    <td>
                      <span className={`badge ${statusClass}`}>
                        {statusText}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-primary"
                        onClick={() => onBook(event)}
                        disabled={booked || started}
                        style={{ padding: '5px 14px', fontSize: 12 }}
                      >
                        Book
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default EventList;