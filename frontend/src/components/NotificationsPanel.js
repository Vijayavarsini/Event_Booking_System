import React from 'react';

function NotificationsPanel({ notifications }) {
  const sent = notifications.filter((n) => n.notification_status === 'sent');
  const pending = notifications.filter((n) => n.notification_status === 'pending');

  return (
    <div className="card" style={{ marginBottom: 18 }}>
      <div className="section-header">
        <span className="section-title">Notifications</span>
        <span className="badge badge-neutral">{sent.length} sent / {pending.length} pending</span>
      </div>

      <div style={{ padding: '12px 18px' }}>
        {notifications.length === 0 ? (
          <div style={{ color: 'var(--muted)', fontSize: 13 }}>
            No notifications yet.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {notifications.slice(0, 6).map((item) => {
              const started = new Date(item.event_time) <= new Date();
              const sentStatus = item.notification_status === 'sent';
              const badgeText = started ? 'Started' : sentStatus ? 'Sent' : 'Pending';
              const badgeClass = started ? 'badge-danger' : sentStatus ? 'badge-success' : 'badge-neutral';
              const cardBg = started ? '#fff7ed' : sentStatus ? '#ecfdf3' : 'var(--surface2)';
              return (
                <div
                  key={item.booking_id}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    padding: '10px 12px',
                    background: cardBg,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                    <strong style={{ fontSize: 13 }}>{item.event_name}</strong>
                    <span className={`badge ${badgeClass}`}>
                      {badgeText}
                    </span>
                  </div>
                  <div style={{ marginTop: 5, fontSize: 12, color: 'var(--muted)' }}>
                    Event: {new Date(item.event_time).toLocaleString()} | Tickets: {item.number_of_tickets}
                  </div>
                  <div style={{ marginTop: 3, fontSize: 12, color: 'var(--muted)' }}>
                    Reminder time: {item.scheduled_time ? new Date(item.scheduled_time).toLocaleString() : 'Not scheduled'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationsPanel;
