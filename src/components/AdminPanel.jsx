import React, { useState, useEffect } from 'react';
import { db, storage, isConfigured } from '../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { PlusCircle, Edit2, Trash2, Calendar, MapPin, Upload, RefreshCw, X } from 'lucide-react';

export default function AdminPanel({ events, setEvents, onEventAdded, onEventUpdated, onEventDeleted }) {
  // Form State
  const [id, setId] = useState(null); // Null if adding new, set if editing
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Dialogue');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [venue, setVenue] = useState('');
  const [status, setStatus] = useState('upcoming');
  const [needsVolunteers, setNeedsVolunteers] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [activeTab, setActiveTab] = useState('form');

  // Load event details into form when editing
  const handleEditSelect = (event) => {
    setId(event.id);
    setTitle(event.title);
    setDescription(event.description);
    setCategory(event.category);
    setDate(event.date);
    setTime(event.time || '');
    setVenue(event.venue);
    setStatus(event.status);
    setNeedsVolunteers(event.needsVolunteers ?? false);
    setImageUrl(event.imageUrl || '');
    setImagePreview(event.imageUrl || '');
    setImageFile(null);
    setMessage({ text: 'Loaded event for editing.', type: 'info' });
    setActiveTab('form');
  };

  // Reset form inputs
  const resetForm = () => {
    setId(null);
    setTitle('');
    setDescription('');
    setCategory('Dialogue');
    setDate('');
    setTime('');
    setVenue('');
    setStatus('upcoming');
    setNeedsVolunteers(false);
    setImageUrl('');
    setImagePreview('');
    setImageFile(null);
  };

  // Handle image file selection and create local preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    let finalImageUrl = imageUrl;

    try {
      // 1. Handle Image Upload
      if (imageFile) {
        if (isConfigured && storage) {
          // Upload to Firebase Storage
          const storageRef = ref(storage, `events/${Date.now()}_${imageFile.name}`);
          const snapshot = await uploadBytes(storageRef, imageFile);
          finalImageUrl = await getDownloadURL(snapshot.ref);
        } else {
          // Local Mock Mode: Use base64 preview as the imageUrl (stored in localStorage)
          finalImageUrl = imagePreview;
        }
      }

      // Event object payload
      const eventData = {
        title,
        description,
        category,
        date,
        time,
        venue,
        status,
        needsVolunteers,
        imageUrl: finalImageUrl || 'https://images.unsplash.com/photo-1544535830-9d5a477db533?w=800&auto=format&fit=crop&q=60'
      };

      if (id) {
        // --- EDITING EXISTING EVENT ---
        if (isConfigured && db) {
          const docRef = doc(db, 'events', id);
          await updateDoc(docRef, eventData);
        }
        onEventUpdated({ id, ...eventData });
        setMessage({ text: 'Event updated successfully!', type: 'success' });
      } else {
        // --- CREATING NEW EVENT ---
        let newId = Date.now().toString();
        if (isConfigured && db) {
          const docRef = await addDoc(collection(db, 'events'), eventData);
          newId = docRef.id;
        }
        onEventAdded({ id: newId, ...eventData });
        setMessage({ text: 'Event created successfully!', type: 'success' });
      }
      resetForm();
      setActiveTab('list');
    } catch (err) {
      console.error(err);
      setMessage({ text: `Failed to save event: ${err.message}`, type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  // Delete Event Handler
  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      if (isConfigured && db) {
        const docRef = doc(db, 'events', eventId);
        await deleteDoc(docRef);
      }
      onEventDeleted(eventId);
      setMessage({ text: 'Event deleted successfully!', type: 'success' });
      if (id === eventId) resetForm();
    } catch (err) {
      console.error(err);
      setMessage({ text: `Failed to delete: ${err.message}`, type: 'danger' });
    }
  };

  return (
    <div className="container">
      
      {/* Mobile Admin Navigation Tabs */}
      <div className="dashboard-tabs">
        <button 
          type="button"
          className={`dashboard-tab-btn ${activeTab === 'form' ? 'active' : ''}`}
          onClick={() => setActiveTab('form')}
        >
          {id ? '📝 Edit Event' : '📝 Create Event'}
        </button>
        <button 
          type="button"
          className={`dashboard-tab-btn ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          📋 Manage Events
        </button>
      </div>

      <div className={`dashboard-grid show-${activeTab}`}>
        {/* Form Panel */}
        <div className="admin-form-card glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 className="dashboard-title" style={{ margin: 0, border: 0, padding: 0 }}>
              {id ? 'Edit Event' : 'Add New Event'}
            </h3>
            {id && (
              <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={resetForm}>
                <X size={14} /> Cancel Edit
              </button>
            )}
          </div>

          {message.text && (
            <div style={{
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.9rem',
              marginBottom: '20px',
              textAlign: 'left',
              backgroundColor: message.type === 'success' ? 'rgba(22, 163, 74, 0.1)' : message.type === 'danger' ? 'rgba(225, 29, 72, 0.1)' : 'var(--primary-light)',
              color: message.type === 'success' ? 'var(--success)' : message.type === 'danger' ? 'var(--danger)' : 'var(--primary)',
              border: `1px solid ${message.type === 'success' ? 'rgba(22, 163, 74, 0.2)' : message.type === 'danger' ? 'rgba(225, 29, 72, 0.2)' : 'var(--border-color)'}`
            }}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label>Event Title</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Dialogue Forum on Local Autonomy"
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea 
                required 
                rows={4}
                placeholder="Write full details about the event, its agenda, and speaker profiles..."
                className="form-control"
                style={{ resize: 'vertical' }}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>Category</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Dialogue, Outreach, Clean-up"
                  className="form-control"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select 
                  className="form-control"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>Date</label>
                <input 
                  type="date" 
                  required
                  className="form-control"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Time Range</label>
                <input 
                  type="text" 
                  placeholder="e.g. 10:30 AM - 1:00 PM"
                  className="form-control"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Venue (Address)</label>
              <input 
                type="text" 
                required
                placeholder="e.g. Gandhi Bhavan, Kumara Park, Bengaluru"
                className="form-control"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px', margin: '5px 0 10px' }}>
              <input 
                type="checkbox"
                id="needsVolunteers"
                checked={needsVolunteers}
                onChange={(e) => setNeedsVolunteers(e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <label htmlFor="needsVolunteers" style={{ cursor: 'pointer', margin: 0, fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Requires volunteers for this event
              </label>
            </div>

            <div className="form-group">
              <label>Event Banner (Upload or Paste URL)</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input 
                  type="text" 
                  placeholder="Paste Image URL (Optional)"
                  className="form-control"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setImagePreview(e.target.value);
                  }}
                />
                
                <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-light)' }}>- OR -</div>
                
                <input 
                  type="file" 
                  accept="image/*"
                  id="image-file-input"
                  style={{ display: 'none' }}
                  onChange={handleImageChange}
                />
                <label htmlFor="image-file-input" className="image-upload-preview">
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" />
                      <div className="image-upload-preview-overlay">Click to replace photo</div>
                    </>
                  ) : (
                    <>
                      <Upload size={24} style={{ marginBottom: '8px' }} />
                      <span>Select Banner Image File</span>
                    </>
                  )}
                </label>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
              style={{ padding: '12px', marginTop: '10px' }}
            >
              {loading ? (
                <>
                  <RefreshCw className="spinner" size={16} /> Saving Event...
                </>
              ) : id ? (
                <>
                  <Edit2 size={16} /> Update Event Post
                </>
              ) : (
                <>
                  <PlusCircle size={16} /> Publish Event
                </>
              )}
            </button>
          </form>
        </div>

        {/* List Panel */}
        <div className="admin-list-card glass-panel">
          <h3 className="dashboard-title">Active Events ({events.length})</h3>
          
          {events.length === 0 ? (
            <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: '40px 0' }}>
              No events found. Use the form to add one!
            </p>
          ) : (
            <div className="admin-event-list">
              {events
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((event) => (
                  <div key={event.id} className="admin-event-row">
                    <div className="admin-event-info">
                      <img 
                        src={event.imageUrl || 'https://images.unsplash.com/photo-1544535830-9d5a477db533?w=800&auto=format&fit=crop&q=60'} 
                        alt="" 
                        className="admin-event-thumb"
                      />
                      <div className="admin-event-details">
                        <h4>{event.title}</h4>
                        <p style={{ display: 'flex', gap: '12px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={12} /> {event.date}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={12} /> {event.venue.split(',')[0]}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="admin-actions">
                      <button 
                        onClick={() => handleEditSelect(event)} 
                        className="btn-icon"
                        title="Edit Event"
                        aria-label="Edit Event"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(event.id)} 
                        className="btn-icon btn-icon-danger"
                        title="Delete Event"
                        aria-label="Delete Event"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
