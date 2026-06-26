import React, { useState, useEffect } from 'react';
import { db, auth, isConfigured } from './firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { MOCK_EVENTS } from './data/mockEvents';
import Navbar from './components/Navbar';
import EventCard from './components/EventCard';
import EventModal from './components/EventModal';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import { AlertTriangle } from 'lucide-react';

function App() {
  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('umaylam_theme') || 'light';
  });

  // Routing View state ('home' | 'login' | 'admin')
  const [view, setView] = useState('home');

  // Events list state
  const [events, setEvents] = useState([]);
  
  // Active modal details state
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Authentication user state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Filter state for public feed ('all' | 'upcoming' | 'completed')
  const [filter, setFilter] = useState('all');

  // Apply visual theme to HTML element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('umaylam_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Auth state monitor
  useEffect(() => {
    if (isConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setAuthLoading(false);
        if (currentUser && view === 'login') {
          setView('admin');
        }
      });
      return () => unsubscribe();
    } else {
      // Local storage mock auth check
      const mockUser = localStorage.getItem('umaylam_mock_user');
      if (mockUser) {
        setUser(JSON.parse(mockUser));
      }
      setAuthLoading(false);
    }
  }, [view]);

  // Load events from Firestore or LocalStorage fallback
  useEffect(() => {
    if (isConfigured && db) {
      const q = query(collection(db, 'events'));
      const unsubscribe = onSnapshot(
        q, 
        (snapshot) => {
          const fetchedEvents = [];
          snapshot.forEach((doc) => {
            fetchedEvents.push({ id: doc.id, ...doc.data() });
          });
          
          if (fetchedEvents.length > 0) {
            setEvents(fetchedEvents);
          } else {
            // Seed localStorage events if firestore is empty
            const local = getLocalEvents();
            setEvents(local);
          }
        },
        (error) => {
          console.error("Firestore loading error, falling back to local database:", error);
          setEvents(getLocalEvents());
        }
      );
      return () => unsubscribe();
    } else {
      setEvents(getLocalEvents());
    }
  }, []);

  // Local Storage database accessors
  const getLocalEvents = () => {
    const local = localStorage.getItem('umaylam_events');
    if (local) {
      return JSON.parse(local);
    }
    localStorage.setItem('umaylam_events', JSON.stringify(MOCK_EVENTS));
    return MOCK_EVENTS;
  };

  const saveLocalEvents = (updatedList) => {
    localStorage.setItem('umaylam_events', JSON.stringify(updatedList));
    setEvents(updatedList);
  };

  // Handle successful login
  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    if (!isConfigured) {
      localStorage.setItem('umaylam_mock_user', JSON.stringify(loggedInUser));
    }
    setView('admin');
  };

  // Handle logout
  const handleLogout = async () => {
    if (isConfigured && auth) {
      await signOut(auth);
    } else {
      localStorage.removeItem('umaylam_mock_user');
    }
    setUser(null);
    setView('home');
  };

  // Local CRUD event handlers (for mock mode synchronization)
  const handleEventAdded = (newEvent) => {
    if (!isConfigured) {
      const currentList = getLocalEvents();
      const updatedList = [newEvent, ...currentList];
      saveLocalEvents(updatedList);
    } else {
      // In Firestore, the real-time listener will trigger updates automatically
      // We just prepend to immediate state for smooth UI transition
      setEvents(prev => [newEvent, ...prev.filter(e => e.id !== newEvent.id)]);
    }
  };

  const handleEventUpdated = (updatedEvent) => {
    if (!isConfigured) {
      const currentList = getLocalEvents();
      const updatedList = currentList.map(e => e.id === updatedEvent.id ? updatedEvent : e);
      saveLocalEvents(updatedList);
    } else {
      setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
    }
  };

  const handleEventDeleted = (eventId) => {
    if (!isConfigured) {
      const currentList = getLocalEvents();
      const updatedList = currentList.filter(e => e.id !== eventId);
      saveLocalEvents(updatedList);
    } else {
      setEvents(prev => prev.filter(e => e.id !== eventId));
    }
  };

  // Handle volunteer registrations (saves in local storage or console logs)
  const handleRegisterVolunteer = async (eventId, volunteerData) => {
    console.log("Registered Volunteer for event:", eventId, volunteerData);
    
    // Save to local storage for testing
    const currentVolunteers = JSON.parse(localStorage.getItem('umaylam_volunteers') || '[]');
    currentVolunteers.push({
      id: Date.now().toString(),
      registeredAt: new Date().toISOString(),
      ...volunteerData
    });
    localStorage.setItem('umaylam_volunteers', JSON.stringify(currentVolunteers));
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
  };

  // Filtered public feed
  const filteredEvents = events.filter(event => {
    if (filter === 'upcoming') return event.status === 'upcoming';
    if (filter === 'completed') return event.status === 'completed';
    return true;
  });

  return (
    <>
      <Navbar 
        currentView={view} 
        setView={setView} 
        theme={theme} 
        toggleTheme={toggleTheme}
        user={user}
        handleLogout={handleLogout}
      />

      {/* Database fallback notification ribbon */}
      {!isConfigured && view === 'admin' && (
        <div style={{
          backgroundColor: 'var(--accent-light)',
          color: 'var(--accent)',
          borderBottom: '1px solid var(--border-color)',
          padding: '8px 24px',
          textAlign: 'center',
          fontSize: '0.85rem',
          fontWeight: 500,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertTriangle size={16} />
          <span>Local Mock Database Active. Events added/edited here are stored locally in your browser.</span>
        </div>
      )}

      {/* Main Section Routing */}
      <main style={{ flexGrow: 1 }}>
        {authLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <span style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>Loading portal...</span>
          </div>
        ) : (
          <>
            {/* VIEW: Public Portal Home */}
            {view === 'home' && (
              <>
                <section className="hero-sec">
                  <div className="container">
                    <h1 className="hero-title">Middleway Approach</h1>
                    <p className="hero-desc">
                      Umaylam Bengaluru Branch. Promoting dialogue, autonomy, consensus, and moderate political strategies to bridge divisions and build consensual social progress.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <button className="btn btn-primary" onClick={() => {
                        const el = document.getElementById('event-feed');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}>
                        Explore Events
                      </button>
                    </div>
                  </div>
                </section>

                <section id="event-feed" className="event-feed-section">
                  <div className="container">
                    <div className="section-header">
                      <h2 className="section-title">Events Feed</h2>
                      
                      <div className="filter-bar">
                        <button 
                          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                          onClick={() => setFilter('all')}
                        >
                          All Events
                        </button>
                        <button 
                          className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
                          onClick={() => setFilter('upcoming')}
                        >
                          Upcoming
                        </button>
                        <button 
                          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
                          onClick={() => setFilter('completed')}
                        >
                          Past/Completed
                        </button>
                      </div>
                    </div>

                    {filteredEvents.length === 0 ? (
                      <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <p style={{ fontSize: '1.1rem' }}>No events found in this category.</p>
                      </div>
                    ) : (
                      <div className="event-grid">
                        {filteredEvents
                          .sort((a, b) => new Date(b.date) - new Date(a.date))
                          .map((event) => (
                            <EventCard 
                              key={event.id} 
                              event={event} 
                              onOpenDetails={setSelectedEvent} 
                            />
                          ))}
                      </div>
                    )}
                  </div>
                </section>
              </>
            )}

            {/* VIEW: Login Interface */}
            {view === 'login' && (
              <Login onLoginSuccess={handleLoginSuccess} />
            )}

            {/* VIEW: Admin Management Dashboard */}
            {view === 'admin' && user && (
              <AdminPanel 
                events={events}
                setEvents={setEvents}
                onEventAdded={handleEventAdded}
                onEventUpdated={handleEventUpdated}
                onEventDeleted={handleEventDeleted}
              />
            )}
          </>
        )}
      </main>

      <footer className="footer">
        <div className="container footer-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 700, color: 'var(--primary)' }}>Umaylam</span>
            <span style={{ color: 'var(--text-light)' }}>| Bengaluru Branch</span>
          </div>
          <div className="footer-text" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span>© {new Date().getFullYear()} Middleway Approach Bengaluru. All rights reserved.</span>
            <span style={{ color: 'var(--border-color)' }}>|</span>
            <button 
              onClick={() => setView(user ? 'admin' : 'login')}
              style={{ 
                color: 'var(--text-light)', 
                fontSize: '0.8rem', 
                fontWeight: 500,
                cursor: 'pointer',
                opacity: 0.6,
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.opacity = 1}
              onMouseLeave={(e) => e.target.style.opacity = 0.6}
            >
              Staff Portal
            </button>
          </div>
        </div>
      </footer>

      {/* Details Dialog Modal Overlay */}
      {selectedEvent && (
        <EventModal 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)}
          onRegisterVolunteer={handleRegisterVolunteer}
        />
      )}
    </>
  );
}

export default App;
