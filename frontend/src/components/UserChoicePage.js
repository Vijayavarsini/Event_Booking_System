import React from 'react';

function UserChoicePage({ onChooseCreate, onChooseBook, onChooseCalendar, lastChoice }) {
  const readableLastChoice =
    lastChoice === '/create-event'
      ? 'Create Event'
      : lastChoice === '/book-event'
        ? 'Book Event'
        : lastChoice === '/my-calendar'
          ? 'My Calendar'
        : null;

  return (
    <div className="card">
      <div className="section-header">
        <span className="section-title">Choose Your Action</span>
        {readableLastChoice && <span className="badge badge-neutral">Last: {readableLastChoice}</span>}
      </div>

      <div style={{ padding: '22px 24px 26px' }}>
        <p style={{ color: 'var(--muted)', marginBottom: 20, fontSize: 14 }}>
          Select what you want to do next.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 14,
        }}>
          <button
            className="btn btn-primary"
            onClick={onChooseCreate}
            style={{
              justifyContent: 'center',
              minHeight: 72,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Create Event
          </button>

          <button
            className="btn btn-ghost"
            onClick={onChooseBook}
            style={{
              justifyContent: 'center',
              minHeight: 72,
              fontSize: 14,
              fontWeight: 600,
              borderColor: 'var(--accent)',
              color: 'var(--accent)',
              background: '#f7f9ff',
            }}
          >
            Book Event
          </button>

          <button
            className="btn btn-ghost"
            onClick={onChooseCalendar}
            style={{
              justifyContent: 'center',
              minHeight: 72,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            My Calendar
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserChoicePage;
