import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import EventList from './components/EventList';
import BookingModal from './components/BookingModal';
import CreateEventForm from './components/CreateEventForm';
import BookingList from './components/BookingList';
import AuthPage from './components/AuthPage';
import UserChoicePage from './components/UserChoicePage';
import MyCalendar from './components/MyCalendar';
import NotificationsPanel from './components/NotificationsPanel';
import {
  getAllEvents,
  bookEvent,
  cancelBooking,
  createEvent,
  getAllBookings,
  getMyNotifications,
  WS_URL,
  clearAuthSession,
  getStoredUsername,
} from './api/eventsApi';

const LAST_CHOICE_KEY = 'event_booking_last_choice';

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:       #f6f8fc;
    --surface:  #ffffff;
    --surface2: #f8faff;
    --border:   #dce3ef;
    --accent:   #2f5bea;
    --accent2:  #4e79f4;
    --success:  #16a34a;
    --danger:   #dc2626;
    --warn:     #d97706;
    --text:     #17223a;
    --muted:    #60708f;
    --radius:   12px;
    --radius-sm: 8px;
    --font:     'DM Sans', sans-serif;
    --mono:     'DM Mono', monospace;
    --shadow:   0 1px 3px rgba(18,33,74,.08), 0 10px 24px rgba(18,33,74,.06);
    --shadow-soft: 0 6px 16px rgba(18,33,74,.08);
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--font);
    font-size: 14px;
    line-height: 1.6;
    min-height: 100vh;
  }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

  table { width: 100%; border-collapse: collapse; }
  th {
    font-size: 11px; font-weight: 600; letter-spacing: .08em;
    text-transform: uppercase; color: var(--muted);
    padding: 12px 16px; background: var(--surface2);
    border-bottom: 1px solid var(--border); text-align: left;
  }
  td {
    padding: 14px 16px;
    border-bottom: 1px solid var(--border);
    color: var(--text);
    vertical-align: middle;
  }
  tbody tr:last-child td { border-bottom: none; }
  tbody tr:hover { background: #f7f9ff; transition: background .15s; }

  input, textarea, select {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text);
    font-family: var(--font);
    font-size: 14px;
    padding: 10px 12px;
    outline: none;
    transition: border-color .2s, box-shadow .2s;
    width: 100%;
  }
  input:focus, textarea:focus, select:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(67,97,238,.12);
  }
  input::placeholder, textarea::placeholder { color: #b0baca; }

  label {
    display: block; font-size: 12px; font-weight: 500;
    color: var(--muted); margin-bottom: 5px; letter-spacing: .03em;
  }

  .btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 9px 16px; border-radius: var(--radius-sm); border: 1px solid transparent;
    font-family: var(--font); font-size: 13px; font-weight: 500;
    cursor: pointer; transition: all .18s; white-space: nowrap;
  }
  .btn-primary { background: var(--accent); color: #fff; }
  .btn-primary:hover { background: #244cd1; box-shadow: 0 6px 18px rgba(47,91,234,.28); transform: translateY(-1px); }
  .btn-danger  { background: var(--danger); color: #fff; }
  .btn-danger:hover  { background: #b91c1c; }
  .btn-ghost   { background: #fff; color: var(--muted); border-color: var(--border); }
  .btn-ghost:hover   { color: var(--text); border-color: #b9c8ec; background: #f3f7ff; }
  .btn:disabled { opacity: .4; cursor: not-allowed; }

  .badge {
    display: inline-flex; align-items: center; justify-content: center;
    padding: 2px 9px; border-radius: 20px;
    font-size: 11px; font-weight: 600; letter-spacing: .04em;
  }
  .badge-success { background: #dcfce7; color: #15803d; }
  .badge-danger  { background: #fee2e2; color: #b91c1c; }
  .badge-neutral { background: #f1f3f9; color: var(--muted); }

  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow-soft);
    overflow: hidden;
  }

  .section-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 20px; border-bottom: 1px solid var(--border);
    background: var(--surface);
  }
  .section-title {
    font-size: 12px; font-weight: 600; letter-spacing: .07em;
    text-transform: uppercase; color: var(--muted);
  }

  .toast {
    position: fixed; bottom: 24px; right: 24px;
    padding: 12px 18px; border-radius: 8px;
    font-size: 13px; font-weight: 500;
    box-shadow: 0 8px 32px rgba(0,0,0,.15);
    animation: slideUp .25s ease;
    z-index: 9999; max-width: 340px;
  }
  .toast-success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; }
  .toast-error   { background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; }
  @keyframes slideUp {
    from { transform: translateY(16px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }

  .seat-bar-wrap { display: flex; align-items: center; gap: 8px; }
  .seat-bar-bg { flex: 1; height: 5px; background: var(--border); border-radius: 3px; overflow: hidden; }
  .seat-bar-fill { height: 100%; border-radius: 3px; transition: width .4s ease; }
  .table-scroll { overflow-x: auto; }

  .app-shell {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px 20px 56px;
  }

  .app-header {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 14px;
    margin-bottom: 24px;
    padding: 12px 0 18px;
    border-bottom: 1px solid var(--border);
  }

  .brand-wrap { display: flex; align-items: center; gap: 12px; }
  .brand-logo {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: linear-gradient(140deg, var(--accent), var(--accent2));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    box-shadow: 0 8px 20px rgba(47,91,234,.2);
  }

  .top-nav {
    display: flex;
    justify-content: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .shell-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    justify-content: flex-end;
    flex-wrap: wrap;
  }

  .status-pill {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 6px 13px;
    border-radius: 999px;
    background: #fff;
    border: 1px solid var(--border);
    box-shadow: var(--shadow);
    font-size: 12px;
    font-weight: 500;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px 24px;
  }

  .auth-container {
    max-width: 460px;
    margin: 64px auto 0;
    padding: 0 16px;
  }

  @media (max-width: 900px) {
    .app-header {
      grid-template-columns: 1fr;
      justify-items: stretch;
      gap: 12px;
    }
    .top-nav {
      justify-content: flex-start;
    }
    .shell-actions {
      justify-content: flex-start;
    }
    .form-grid {
      grid-template-columns: 1fr;
    }
  }
`;

function ProtectedRoute({ currentUser }) {
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

function AppShell({ currentUser, wsInfo, handleLogout, message, error, onNavigate, activePath, notifications, children }) {
  const navItems = [
    { label: 'Create Event', path: '/create-event' },
    { label: 'Book Event', path: '/book-event' },
    { label: 'My Calendar', path: '/my-calendar' },
  ];

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand-wrap">
          <div className="brand-logo">🎟</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', letterSpacing: '-.01em' }}>
              Event Booking
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '.05em' }}>
              MANAGEMENT SYSTEM
            </div>
          </div>
        </div>

        <div className="top-nav">
          {navItems.map((item) => {
            const isActive = activePath === item.path;
            return (
              <button
                key={item.path}
                className={isActive ? 'btn btn-primary' : 'btn btn-ghost'}
                onClick={() => onNavigate(item.path)}
                style={{ padding: '6px 12px', fontSize: 12 }}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="shell-actions">
          <div className="status-pill" style={{ color: wsInfo.color }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: wsInfo.dot, boxShadow: wsInfo.glow,
            }} />
            {wsInfo.label}
          </div>

          <span className="badge badge-neutral" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {currentUser}
          </span>

          <button className="btn btn-ghost" onClick={handleLogout} style={{ padding: '6px 12px', fontSize: 12 }}>
            Logout
          </button>
        </div>
      </header>

      {message && <div className="toast toast-success">{message}</div>}
      {error && <div className="toast toast-error">{error}</div>}

      <NotificationsPanel notifications={notifications} />

      {children}
    </div>
  );
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [events, setEvents]               = useState([]);
  const [bookings, setBookings]           = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading]             = useState(false);
  const [message, setMessage]             = useState(null);
  const [error, setError]                 = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [wsStatus, setWsStatus]           = useState('connecting');
  const [currentUser, setCurrentUser]     = useState(() => getStoredUsername());
  const wsRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const shouldReconnectRef = useRef(false);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = GLOBAL_CSS;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const showMessage = (msg, isError = false) => {
    if (isError) { setError(msg); setMessage(null); }
    else          { setMessage(msg); setError(null); }
    setTimeout(() => { setMessage(null); setError(null); }, 5000);
  };

  const fetchAll = useCallback(async () => {
    if (!currentUser) return;
    try {
      const [eventsRes, bookingsRes, notificationsRes] = await Promise.all([
        getAllEvents(),
        getAllBookings(),
        getMyNotifications(),
      ]);
      setEvents(eventsRes.data);
      setBookings(bookingsRes.data.map((b) => ({
        ...b,
        eventName: eventsRes.data.find((e) => e.id === b.event_id)?.name || `Event #${b.event_id}`,
        eventDate: eventsRes.data.find((e) => e.id === b.event_id)?.date || null,
      })));
      setNotifications(notificationsRes.data || []);
    } catch (err) {
      showMessage(`Failed to load data: ${err.message}`, true);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return undefined;
    const timer = setInterval(() => {
      fetchAll();
    }, 30000);
    return () => clearInterval(timer);
  }, [currentUser, fetchAll]);

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const connectWebSocket = useCallback(() => {
    clearReconnectTimer();

    if (
      wsRef.current &&
      (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    setWsStatus('connecting');
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;
    ws.onopen = () => {
      if (wsRef.current !== ws) return;
      setWsStatus('open');
    };
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'seat_update') {
          setEvents((prev) => prev.map((ev) =>
            ev.id === data.event_id ? { ...ev, available_seats: data.available_seats } : ev
          ));
        }
      } catch (_) {}
    };
    ws.onclose = () => {
      if (wsRef.current === ws) {
        wsRef.current = null;
      }

      setWsStatus('closed');
      if (!shouldReconnectRef.current) return;

      reconnectTimerRef.current = setTimeout(() => {
        if (!shouldReconnectRef.current) return;
        connectWebSocket();
      }, 3000);
    };
    ws.onerror = () => {
      if (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [clearReconnectTimer]);

  useEffect(() => {
    if (!currentUser) {
      shouldReconnectRef.current = false;
      clearReconnectTimer();
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setWsStatus('closed');
      setBookings([]);
      setEvents([]);
      setNotifications([]);
      setSelectedEvent(null);
      return;
    }

    shouldReconnectRef.current = true;
    const init = async () => { setLoading(true); await fetchAll(); setLoading(false); };
    init();
    connectWebSocket();
    return () => {
      shouldReconnectRef.current = false;
      clearReconnectTimer();
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [fetchAll, connectWebSocket, currentUser, clearReconnectTimer]);

  const handleBook = (event) => setSelectedEvent(event);

  const handleConfirmBooking = async (eventId, numberOfTickets = 1) => {
    setSelectedEvent(null);
    try {
      await bookEvent(eventId, numberOfTickets);
      const bookingsRes = await getAllBookings();
      setBookings(bookingsRes.data.map((b) => ({
        ...b,
        eventName: events.find((e) => e.id === b.event_id)?.name || `Event #${b.event_id}`,
        eventDate: events.find((e) => e.id === b.event_id)?.date || null,
      })));
      showMessage(
        `Booking confirmed: ${numberOfTickets} ticket(s) reserved successfully.`
      );
    } catch (err) {
      showMessage(`Booking failed: ${err.message}`, true);
    }
  };

  const handleAuthSuccess = async (username) => {
    setCurrentUser(username);
    setWsStatus('connecting');
    setLoading(true);
    await fetchAll();
    setLoading(false);
    navigate('/choose-action', { replace: true });
  };

  const handleLogout = () => {
    clearAuthSession();
    setCurrentUser(null);
    setBookings([]);
    setSelectedEvent(null);
    showMessage('Logged out successfully.');
    navigate('/login', { replace: true });
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await cancelBooking(bookingId);
      const bookingsRes = await getAllBookings();
      setBookings(bookingsRes.data.map((b) => ({
        ...b,
        eventName: events.find((e) => e.id === b.event_id)?.name || `Event #${b.event_id}`,
        eventDate: events.find((e) => e.id === b.event_id)?.date || null,
      })));
      showMessage(`Booking #${bookingId} cancelled. Seat restored.`);
    } catch (err) {
      showMessage(`Cancel failed: ${err.message}`, true);
    }
  };

  const handleCreateEvent = async (eventData) => {
    try {
      await createEvent(eventData);
      showMessage(`Event "${eventData.name}" created successfully.`);
      await fetchAll();
    } catch (err) {
      showMessage(`Failed to create event: ${err.message}`, true);
    }
  };

  const wsInfo = {
    open:       { color: '#16a34a', dot: '#22c55e', label: 'Live',         glow: '0 0 6px #22c55e' },
    connecting: { color: '#d97706', dot: '#f59e0b', label: 'Connecting...', glow: 'none' },
    closed:     { color: '#dc2626', dot: '#ef4444', label: 'Disconnected', glow: 'none' },
  }[wsStatus];

  const chooseAction = (path) => {
    localStorage.setItem(LAST_CHOICE_KEY, path);
    navigate(path);
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          currentUser ? (
            <Navigate to="/choose-action" replace />
          ) : (
            <>
              <div style={{ maxWidth: 1140, margin: '0 auto', padding: '28px 24px 0' }}>
                <header style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginBottom: 16, paddingBottom: 20, borderBottom: '1px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 9,
                      background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                    }}>🎟</div>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', letterSpacing: '-.01em' }}>
                        Event Booking
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '.05em' }}>
                        MANAGEMENT SYSTEM
                      </div>
                    </div>
                  </div>
                </header>
              </div>
              <AuthPage onAuthSuccess={handleAuthSuccess} />
            </>
          )
        }
      />

      <Route element={<ProtectedRoute currentUser={currentUser} />}>
        <Route
          path="/choose-action"
          element={
            <AppShell
              currentUser={currentUser}
              wsInfo={wsInfo}
              handleLogout={handleLogout}
              message={message}
              error={error}
              onNavigate={chooseAction}
              activePath={location.pathname}
              notifications={notifications}
            >
              <UserChoicePage
                onChooseCreate={() => chooseAction('/create-event')}
                onChooseBook={() => chooseAction('/book-event')}
                onChooseCalendar={() => chooseAction('/my-calendar')}
                lastChoice={localStorage.getItem(LAST_CHOICE_KEY)}
              />
            </AppShell>
          }
        />

        <Route
          path="/my-calendar"
          element={
            <AppShell
              currentUser={currentUser}
              wsInfo={wsInfo}
              handleLogout={handleLogout}
              message={message}
              error={error}
              onNavigate={chooseAction}
              activePath={location.pathname}
              notifications={notifications}
            >
              <MyCalendar />
            </AppShell>
          }
        />

        <Route
          path="/create-event"
          element={
            <AppShell
              currentUser={currentUser}
              wsInfo={wsInfo}
              handleLogout={handleLogout}
              message={message}
              error={error}
              onNavigate={chooseAction}
              activePath={location.pathname}
              notifications={notifications}
            >
              <CreateEventForm onCreateEvent={handleCreateEvent} />
            </AppShell>
          }
        />

        <Route
          path="/book-event"
          element={
            <AppShell
              currentUser={currentUser}
              wsInfo={wsInfo}
              handleLogout={handleLogout}
              message={message}
              error={error}
              onNavigate={chooseAction}
              activePath={location.pathname}
              notifications={notifications}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <EventList events={events} onBook={handleBook} loading={loading} />
                <BookingList bookings={bookings} onCancel={handleCancelBooking} />
              </div>
              {selectedEvent && (
                <BookingModal
                  event={selectedEvent}
                  onConfirm={handleConfirmBooking}
                  onClose={() => setSelectedEvent(null)}
                  currentUser={currentUser}
                />
              )}
            </AppShell>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to={currentUser ? '/choose-action' : '/login'} replace />} />
    </Routes>
  );
}

export default App;