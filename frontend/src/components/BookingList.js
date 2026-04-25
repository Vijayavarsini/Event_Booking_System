import React, { useState, useMemo } from 'react';

function BookingList({ bookings, onCancel }) {
  const [searchUser, setSearchUser]   = useState('');
  const [filterEvent, setFilterEvent] = useState('');
  const [sortOrder, setSortOrder]     = useState('newest');

  const eventOptions = useMemo(() => (
    [...new Set(bookings.map((b) => b.eventName))].sort()
  ), [bookings]);

  const filtered = useMemo(() => {
    let r = [...bookings];
    if (searchUser.trim()) {
      const q = searchUser.trim().toLowerCase();
      r = r.filter((b) => b.user_name.toLowerCase().includes(q));
    }
    if (filterEvent) r = r.filter((b) => b.eventName === filterEvent);
    r.sort((a, b) => {
      const d = new Date(a.booking_date) - new Date(b.booking_date);
      return sortOrder === 'newest' ? -d : d;
    });
    return r;
  }, [bookings, searchUser, filterEvent, sortOrder]);

  const clearFilters = () => { setSearchUser(''); setFilterEvent(''); setSortOrder('newest'); };
  const hasFilter = searchUser || filterEvent || sortOrder !== 'newest';

  return (
    <div className="card">
      <div className="section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="section-title">All Bookings</span>
          <span className="badge badge-neutral">{filtered.length}/{bookings.length}</span>
        </div>
        {hasFilter && (
          <button className="btn btn-ghost" onClick={clearFilters} style={{ fontSize: 12, padding: '4px 12px' }}>
            ✕ Clear
          </button>
        )}
      </div>

      {/* Filter bar */}
      <div style={{
        display: 'flex', gap: 12, flexWrap: 'wrap',
        padding: '14px 20px', borderBottom: '1px solid var(--border)',
        background: 'var(--surface2)',
      }}>
        <div style={{ flex: '1 1 180px', minWidth: 140 }}>
          <label>Search by name</label>
          <input type="text" placeholder="e.g. Alice" value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)} />
        </div>
        <div style={{ flex: '1 1 200px', minWidth: 160 }}>
          <label>Filter by event</label>
          <select value={filterEvent} onChange={(e) => setFilterEvent(e.target.value)}>
            <option value="">All events</option>
            {eventOptions.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div style={{ flex: '0 0 150px' }}>
          <label>Sort</label>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div style={{ padding: '44px', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>No bookings yet.</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: '36px', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
          No results.{' '}
          <button onClick={clearFilters} style={{
            background: 'none', border: 'none', color: 'var(--accent)',
            cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 14,
          }}>Clear filters</button>
        </div>
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th style={{ width: 80 }}>ID</th>
                <th>Event</th>
                <th>Booked By</th>
                <th style={{ width: 120 }}>Tickets</th>
                <th style={{ width: 110 }}>Event Status</th>
                <th>Booked At</th>
                <th style={{ width: 90 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => {
                const started = b.eventDate ? new Date(b.eventDate) <= new Date() : false;
                return (
                <tr key={b.id}>
                  <td>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)' }}>
                      #{b.id}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{b.eventName}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>Event #{b.event_id}</div>
                  </td>
                  <td>{highlight(b.user_name, searchUser)}</td>
                  <td>
                    <span className="badge badge-neutral">{b.number_of_tickets || 1}</span>
                  </td>
                  <td>
                    <span className={`badge ${started ? 'badge-danger' : 'badge-success'}`}>
                      {started ? 'Started' : 'Upcoming'}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                    {new Date(b.booking_date).toLocaleString()}
                  </td>
                  <td>
                    <button className="btn btn-danger" onClick={() => onCancel(b.id)}
                      style={{ padding: '5px 12px', fontSize: 12 }}>
                      Cancel
                    </button>
                  </td>
                </tr>
              );})}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function highlight(text, query) {
  if (!query.trim()) return text;
  const idx = text.toLowerCase().indexOf(query.trim().toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: '#dbeafe', color: '#1d4ed8', borderRadius: 2, padding: '0 1px' }}>
        {text.slice(idx, idx + query.trim().length)}
      </mark>
      {text.slice(idx + query.trim().length)}
    </>
  );
}

export default BookingList;