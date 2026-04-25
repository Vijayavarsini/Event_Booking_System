import React, { useEffect, useMemo, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { getMyCalendar } from '../api/eventsApi';

function MyCalendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCalendar = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getMyCalendar();
        const normalized = (response.data || []).map((item) => ({
          id: String(item.id),
          title: item.title,
          start: item.start,
          end: item.end || item.start,
          extendedProps: {
            description: item.description || '',
          },
        }));
        setEvents(normalized);
      } catch (err) {
        setError(err.message || 'Failed to load calendar events.');
      } finally {
        setLoading(false);
      }
    };

    loadCalendar();
  }, []);

  const calendarHeight = useMemo(() => (window.innerWidth < 768 ? 620 : 740), []);

  return (
    <div className="card">
      <div className="section-header">
        <span className="section-title">My Calendar</span>
      </div>

      <div style={{ padding: '18px 20px 24px' }}>
        {loading && (
          <div style={{ color: 'var(--muted)', marginBottom: 12, fontSize: 14 }}>Loading calendar...</div>
        )}

        {error && (
          <div style={{ color: 'var(--danger)', marginBottom: 12, fontSize: 14 }}>
            {error}
          </div>
        )}

        {!loading && !error && (
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            events={events}
            height={calendarHeight}
            nowIndicator
            eventTimeFormat={{ hour: '2-digit', minute: '2-digit', meridiem: false }}
          />
        )}
      </div>
    </div>
  );
}

export default MyCalendar;
