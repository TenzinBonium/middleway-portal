import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, Tag, Users, Check } from 'lucide-react';

export default function EventModal({ event, onClose, onRegisterVolunteer }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email) return;
    
    setSubmitting(true);
    try {
      if (onRegisterVolunteer) {
        await onRegisterVolunteer(event.id, { name, email, phone, eventTitle: event.title });
      } else {
        // Fallback mock submission delay
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      setSubmitted(true);
    } catch (error) {
      console.error("Failed to register volunteer", error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        <img 
          src={event.imageUrl || 'https://images.unsplash.com/photo-1544535830-9d5a477db533?w=800&auto=format&fit=crop&q=60'} 
          alt={event.title} 
          className="modal-img"
        />

        <div className="modal-body">
          <h2 className="modal-title">{event.title}</h2>
          
          <div className="modal-meta-grid">
            <div className="modal-meta-card">
              <div className="modal-meta-icon-wrapper">
                <Calendar size={18} />
              </div>
              <div>
                <div className="modal-meta-label">Date</div>
                <div className="modal-meta-val">{formatDate(event.date)}</div>
              </div>
            </div>

            <div className="modal-meta-card">
              <div className="modal-meta-icon-wrapper">
                <Clock size={18} />
              </div>
              <div>
                <div className="modal-meta-label">Time</div>
                <div className="modal-meta-val">{event.time || 'TBD'}</div>
              </div>
            </div>

            <div className="modal-meta-card">
              <div className="modal-meta-icon-wrapper">
                <MapPin size={18} />
              </div>
              <div>
                <div className="modal-meta-label">Venue</div>
                <div className="modal-meta-val">{event.venue}</div>
              </div>
            </div>

            <div className="modal-meta-card">
              <div className="modal-meta-icon-wrapper">
                <Tag size={18} />
              </div>
              <div>
                <div className="modal-meta-label">Category</div>
                <div className="modal-meta-val">{event.category}</div>
              </div>
            </div>
          </div>

          <div className="modal-description">
            {event.description}
          </div>

          {event.status === 'upcoming' && event.needsVolunteers && (
            <div className="volunteer-section" style={{
              marginTop: '40px',
              padding: '30px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-primary)',
            }}>
              <h3 style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={22} className="logo-icon" style={{ color: 'var(--primary)' }} />
                Volunteer for this Event
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
                Join the Middleway Approach (Umaylam) team in Bengaluru. Help us organize, facilitate dialogue, and manage logistics!
              </p>

              {submitted ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: 'var(--success)',
                  fontWeight: '600',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(22, 163, 74, 0.1)',
                  border: '1px solid rgba(22, 163, 74, 0.2)'
                }}>
                  <Check size={20} />
                  <span>Thank you! We've received your registration and will get in touch shortly.</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group" style={{ gridColumn: 'span 2', marginBottom: '10px' }}>
                    <input 
                      type="text" 
                      placeholder="Your Full Name" 
                      className="form-control"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '10px' }}>
                    <input 
                      type="email" 
                      placeholder="Your Email Address" 
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '10px' }}>
                    <input 
                      type="tel" 
                      placeholder="Phone Number (Optional)" 
                      className="form-control"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={submitting}
                    style={{ gridColumn: 'span 2', marginTop: '10px' }}
                  >
                    {submitting ? 'Submitting...' : 'Register as Volunteer'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
