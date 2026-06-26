import React from 'react';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';

export default function EventCard({ event, onOpenDetails }) {
  const isUpcoming = event.status === 'upcoming';
  
  // Format date nicely
  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="event-card glass-panel">
      <div className="event-card-img-container">
        <img 
          src={event.imageUrl || 'https://images.unsplash.com/photo-1544535830-9d5a477db533?w=800&auto=format&fit=crop&q=60'} 
          alt={event.title} 
          className="event-card-img"
          loading="lazy"
        />
        <span className={`event-badge ${isUpcoming ? 'upcoming' : 'completed'}`}>
          {event.status}
        </span>
      </div>

      <div className="event-card-content">
        <div className="event-meta">
          <div className="event-meta-item">
            <Calendar size={14} />
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="event-meta-item">
            <MapPin size={14} />
            <span style={{
              display: 'inline-block',
              maxWidth: '120px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }} title={event.venue}>
              {event.venue.split(',')[0]}
            </span>
          </div>
        </div>

        <h3 className="event-card-title">{event.title}</h3>
        <p className="event-card-desc">{event.description}</p>

        <div className="event-card-footer">
          <span className="event-category-tag">{event.category}</span>
          <button onClick={() => onOpenDetails(event)} className="read-more-btn">
            Details <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
