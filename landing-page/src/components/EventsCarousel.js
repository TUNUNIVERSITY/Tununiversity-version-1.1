import React, { useEffect, useMemo, useState } from 'react';
import { eventsAPI } from '../services/api';
import './EventsCarousel.css';

const FALLBACK_EVENTS = [
  {
    id: 'fallback-1',
    title: 'Student Success Week',
    description: 'Daily micro-workshops on study tactics, time management, and career readiness.',
    event_type: 'workshop',
    start_date: '2025-11-18',
    end_date: '2025-11-22',
    affects_timetable: false,
  },
  {
    id: 'fallback-2',
    title: 'Campus Infrastructure Upgrade',
    description: 'Power routing work in Building B. Expect lab downtimes after 6 PM.',
    event_type: 'closure',
    start_date: '2025-11-24',
    end_date: '2025-11-25',
    affects_timetable: true,
  },
];

const EVENT_META = {
  holiday: { label: 'Holiday', color: '#F59E0B' },
  conference: { label: 'Conference', color: '#3B82F6' },
  exam: { label: 'Exam Block', color: '#EF4444' },
  workshop: { label: 'Workshop', color: '#10B981' },
  closure: { label: 'Closure', color: '#8B5CF6' },
};

const formatDateRange = (start, end) => {
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (startDate.toDateString() === endDate.toDateString()) {
    return dateFormatter.format(startDate);
  }

  return `${dateFormatter.format(startDate)} – ${dateFormatter.format(endDate)}`;
};

function EventsCarousel() {
  const [events, setEvents] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch events on mount
  useEffect(() => {
    let isMounted = true;

    const fetchEvents = async () => {
      try {
        setLoading(true);
        const { data } = await eventsAPI.getPublicEvents({ limit: 12 });
        if (isMounted) {
          setEvents(data?.events ?? []);
          setActiveIndex(0);
        }
      } catch (err) {
        if (isMounted) {
          setError('Could not load service events right now.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-advance slides
  useEffect(() => {
    if (!events.length) {
      return undefined;
    }

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % events.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [events.length]);

  const displayEvents = useMemo(() => (events.length ? events : FALLBACK_EVENTS), [events]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + displayEvents.length) % displayEvents.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % displayEvents.length);
  };

  if (!displayEvents.length) {
    return null;
  }

  return (
    <section className="events-carousel" aria-label="Upcoming service events">
      <div className="events-carousel__inner">
        <div className="events-carousel__header">
          <div>
            <p className="events-carousel__eyebrow">Events</p>
            <h2>What&apos;s happening next on campus</h2>
          </div>

          <div className="events-carousel__controls" aria-label="Carousel controls">
            <button
              type="button"
              className="events-carousel__control"
              onClick={handlePrev}
              aria-label="Show previous event"
            >
              &lt;
            </button>
            <button
              type="button"
              className="events-carousel__control"
              onClick={handleNext}
              aria-label="Show next event"
            >
              &gt;
            </button>
          </div>
        </div>

        <div className="events-carousel__viewport">
          <div
            className="events-carousel__track"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {displayEvents.map((event) => {
              const meta = EVENT_META[event.event_type] ?? {
                label: event.event_type,
                color: '#6B7280',
              };
              return (
                <article className="events-carousel__card" key={event.id}>
                  <div className="events-carousel__pill" style={{ backgroundColor: meta.color }}>
                    {meta.label}
                  </div>
                  <h3>{event.title}</h3>
                  <p className="events-carousel__date">{formatDateRange(event.start_date, event.end_date)}</p>
                  {event.description && <p className="events-carousel__description">{event.description}</p>}
                  <div className="events-carousel__meta">
                    <span className="events-carousel__meta-label">Schedule impact</span>
                    <span className={`events-carousel__badge ${event.affects_timetable ? 'events-carousel__badge--alert' : ''}`}>
                      {event.affects_timetable ? 'Timetables affected' : 'No timetable changes'}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div className="events-carousel__status" aria-live="polite">
          {loading ? (
            <span>Loading events…</span>
          ) : error ? (
            <span>{error}</span>
          ) : (
            <span>
              {activeIndex + 1}/{displayEvents.length} highlighted events
            </span>
          )}
        </div>
      </div>
    </section>
  );
}

export default EventsCarousel;

