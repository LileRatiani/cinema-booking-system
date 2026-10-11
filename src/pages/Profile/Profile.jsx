import { useState, useEffect, useRef } from 'react';
import './Profile.css';
import { useLocation } from 'react-router-dom';
import { updateProfile, fetchOrders, refundOrder } from '../../api';

export default function Profile({ currentUser, onProfileUpdate }) {
  // Tabs
  const location = useLocation();

  const [activeMainTab, setActiveMainTab] = useState('personal'); 
  const [activeTicketTab, setActiveTicketTab] = useState('upcoming'); 
  
  // Profile States
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    dateOfBirth: '',
    preferredVenueId: ''
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [serverErrors, setServerErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Ticket States
  const [orders, setOrders] = useState([]);
  const [isTicketsLoading, setIsTicketsLoading] = useState(false);

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveMainTab(location.state.activeTab);
    }
  }, [location.state]);
  
  // 1. Load User Data on mount
  useEffect(() => {
    if (currentUser) {
      setFormData({
        fullName: currentUser.fullName || '',
        mobileNumber: currentUser.mobileNumber || '',
        dateOfBirth: currentUser.dateOfBirth || '',
        preferredVenueId: currentUser.preferredVenue?.id || ''
      });
      if (currentUser.avatar) setAvatarPreview(currentUser.avatar);
    }
  }, [currentUser]);

 // 2. Load Tickets when switching tabs
  useEffect(() => {
    if (activeMainTab === 'tickets') {
      const loadOrders = async () => {
        setIsTicketsLoading(true);
        const { status, data } = await fetchOrders(activeTicketTab);
        
        if (status === 200) {
          // Safely extract the array whether it's flat, nested once, or paginated
          const fetchedOrders = Array.isArray(data) 
            ? data 
            : (Array.isArray(data?.data) ? data.data : data?.data?.data || []);
            
          setOrders(fetchedOrders);
        } else {
          setOrders([]);
        }
        setIsTicketsLoading(false);
      };
      loadOrders();
    }
  }, [activeMainTab, activeTicketTab]);

  // --- PROFILE HANDLERS ---
  const handleProfileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (serverErrors[e.target.name]) {
      setServerErrors({ ...serverErrors, [e.target.name]: null });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setServerErrors({});
    setSuccessMessage('');

    const payload = new FormData();
    payload.append('fullName', formData.fullName);
    payload.append('mobileNumber', formData.mobileNumber);
    payload.append('dateOfBirth', formData.dateOfBirth);
    if (formData.preferredVenueId) payload.append('preferredVenueId', formData.preferredVenueId);
    if (avatarFile) payload.append('avatar', avatarFile);

    const { status, data } = await updateProfile(payload);

    if (status === 200) {
      setSuccessMessage('Profile updated successfully!');
      if (onProfileUpdate) onProfileUpdate(data.data);
    } else if (status === 422) {
      setServerErrors(data.errors || {});
    }
    setIsSaving(false);
  };

  const handleRefund = async (orderId) => {
    // 1. Confirm with the user first since it cannot be undone
    if (!window.confirm("Are you sure you want to refund this order? This action cannot be undone.")) {
      return;
    }

    const { status, data } = await refundOrder(orderId);

    if (status === 200) {
      // The API returns the updated order. 
      // Since refunded orders move to the "Past" tab, we can instantly remove it from the "Upcoming" view.
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
      alert("Refund successful. The seats have been released and the order moved to your Past tickets.");
    } else if (status === 422) {
      // The 422 message specifies if it was already refunded or inside the cutoff
      alert(data.message || "This order cannot be refunded.");
    } else if (status === 401 || status === 403) {
      alert("Unauthorized to refund this order.");
    } else {
      alert("An error occurred while processing your refund. Please try again.");
    }
  };
  
  // --- TICKET RENDERER ---
  const renderTicketCard = (order) => {
    const { session, tickets } = order;
    const movie = session.movie;

    return (
      <div key={order.id} className="ticket-card">
        <img src={movie.posterUrl} alt={movie.title} className="ticket-poster" />
        
        <div className="ticket-details">
          <div className="ticket-header">
            <h3>{movie.title}</h3>
            <span className="ticket-age-tag">{movie.ageRating?.code || 'NR'}</span>
            <span className="ticket-duration">{movie.runtimeMinutes} min</span>
          </div>
          
          <div className="ticket-meta-grid">
            <div>
              <p className="meta-label">DATE</p>
              <p className="meta-value">{session.date} • {session.time}</p>
            </div>
            <div>
              <p className="meta-label">VENUE</p>
              <p className="meta-value">{session.venue.name} • Hall {session.hall.name}</p>
            </div>
            <div>
              <p className="meta-label">FORMAT</p>
              <p className="meta-value">{session.format.name} • {session.language.name}</p>
            </div>
          </div>
          
          <div className="ticket-seats">
            <p className="meta-label">SEATS</p>
            <div className="seat-list">
              {tickets.map((ticket, i) => (
                <span key={i} className="seat-badge">{ticket.seatCode} • {ticket.ticketType.name}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="ticket-actions">
          <div className="order-info">
            <p className="meta-label">ORDER</p>
            <p className="order-number">{order.reference}</p>
          </div>
          <div className="price-info">
            <p className="meta-label">Total paid</p>
            <p className="total-price">₾{order.totalPrice}</p>
          </div>
          
          {activeTicketTab === 'upcoming' && (
            <div className="refund-section">
              <button 
                className={`btn-refund ${!order.isRefundable ? 'btn-disabled' : ''}`}
                disabled={!order.isRefundable}
                title={!order.isRefundable ? "Refunds are unavailable within 2 hours of the session start time." : "Refund this order"}
                onClick={() => handleRefund(order.reference)} 
              >
                Refund
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!currentUser) return <div>Loading...</div>;

  const getError = (field) => serverErrors[field] ? serverErrors[field][0] : null;

  return (
    <div className="profile-page">
      <div className="profile-container">
        
        {!currentUser.profileComplete && (
          <div className="profile-warning-banner" style={{ backgroundColor: '#fef08a', color: '#854d0e', padding: '12px', marginBottom: '20px', borderRadius: '4px' }}>
            Profile incomplete. Please complete your profile to enable booking.
          </div>
        )}

        <h1 className="page-title">My Profile</h1>
        
        <div className="main-tabs">
          <button 
            className={`tab-btn ${activeMainTab === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveMainTab('personal')}
          >
            Personal Information
          </button>
          <button 
            className={`tab-btn ${activeMainTab === 'tickets' ? 'active' : ''}`}
            onClick={() => setActiveMainTab('tickets')}
          >
            My Tickets
          </button>
        </div>

        {activeMainTab === 'personal' && (
          <form className="tab-content personal-form" onSubmit={handleSaveProfile}>
            
            <div className="form-group avatar-group" style={{ marginBottom: '20px' }}>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".jpg,.jpeg,.png,.webp" 
                style={{ display: 'none' }} 
              />
              <div 
                className="avatar-preview" 
                onClick={() => fileInputRef.current?.click()}
                style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#4c1d95', cursor: 'pointer', overflow: 'hidden' }}
              >
                 {avatarPreview ? <img src={avatarPreview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: 'white', display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>Upload</span>}
              </div>
              {getError('avatar') && <span className="error-text" style={{ color: 'red' }}>{getError('avatar')}</span>}
            </div>

            <div className="form-group">
              <label>Full name</label>
              <input 
                type="text" 
                name="fullName"
                value={formData.fullName}
                onChange={handleProfileChange}
                className={getError('fullName') ? 'input-error' : ''}
              />
              {getError('fullName') && <span className="error-text" style={{ color: 'red' }}>{getError('fullName')}</span>}
            </div>

            <div className="form-group">
              <label>Email</label>
              <input type="email" value={currentUser.email} disabled className="input-disabled" />
              <span className="helper-text">Set at registration and cannot be changed</span>
            </div>

            <div className="form-group">
              <label>Mobile number</label>
              <input 
                type="text" 
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleProfileChange}
                className={getError('mobileNumber') ? 'input-error' : ''}
              />
              {getError('mobileNumber') && <span className="error-text" style={{ color: 'red' }}>{getError('mobileNumber')}</span>}
            </div>

            <div className="form-group">
              <label>Date of birth</label>
              <input 
                type="date" 
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleProfileChange}
                className={getError('dateOfBirth') ? 'input-error' : ''}
              />
              {getError('dateOfBirth') && <span className="error-text" style={{ color: 'red' }}>{getError('dateOfBirth')}</span>}
              
              {currentUser.age > 0 && !getError('dateOfBirth') && (
                <span className="helper-text" style={{ display: 'block', marginTop: '4px', color: '#10b981' }}>
                  You are {currentUser.age}, you can buy tickets for age-appropriate ratings.
                </span>
              )}
            </div>

            <button type="submit" className="btn-save" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save changes'}
            </button>
            {successMessage && <div style={{ color: '#10b981', marginTop: '10px' }}>{successMessage}</div>}
          </form>
        )}

        {activeMainTab === 'tickets' && (
          <div className="tab-content tickets-section">
            <div className="ticket-subtabs">
              <button 
                className={`subtab-btn ${activeTicketTab === 'upcoming' ? 'active' : ''}`}
                onClick={() => setActiveTicketTab('upcoming')}
              >
                Upcoming
              </button>
              <button 
                className={`subtab-btn ${activeTicketTab === 'past' ? 'active' : ''}`}
                onClick={() => setActiveTicketTab('past')}
              >
                Past
              </button>
            </div>

            <div className="ticket-list">
              {isTicketsLoading ? (
                <p>Loading tickets...</p>
              ) : orders.length > 0 ? (
                orders.map(order => renderTicketCard(order))
              ) : (
                <p className="no-tickets">You have no {activeTicketTab} tickets.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}