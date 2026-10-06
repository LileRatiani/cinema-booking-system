import { useState, useEffect } from 'react';
import './Profile.css';

// Mock data for tickets
const mockUpcomingTickets = [
  {
    id: 1,
    title: "THE ODYSSEY",
    ageRating: "12+",
    duration: "134 min",
    poster: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=400&auto=format&fit=crop",
    dateStr: "Thu 8 Oct • 16:30",
    venue: "Kutaisi Branch • Hall A",
    format: "MAX • Original + Subtitles",
    seats: ["B3 • Adult", "B4 • Adult", "B5 • Student"],
    orderNum: "#KX-48291",
    totalPaid: 32,
    // Future date allowing refunds
    startTime: new Date("2026-10-08T16:30:00+04:00") 
  },
  {
    id: 2,
    title: "DUNE: Part Three",
    ageRating: "12+",
    duration: "134 min",
    poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=400&auto=format&fit=crop",
    dateStr: "Tue 6 Oct • 20:00",
    venue: "Galleria Tbilisi • Hall B",
    format: "MAX • Original + Subtitles",
    seats: ["D3 • Adult", "D4 • Adult"],
    orderNum: "#KX-48292",
    totalPaid: 32,
    // Very close to current time (Oct 6, 2026, 7:18 PM), refund should be disabled
    startTime: new Date("2026-10-06T20:00:00+04:00") 
  }
];

const mockPastTickets = [
  {
    id: 3,
    title: "SPIDER-MAN",
    ageRating: "12+",
    duration: "148 min",
    poster: "https://images.unsplash.com/photo-1635805737707-575885ab0820?q=80&w=400&auto=format&fit=crop",
    dateStr: "Mon 14 Sep • 18:00",
    venue: "Galleria Tbilisi • Hall B",
    format: "Standard • Dubbed",
    seats: ["A1 • Adult"],
    orderNum: "#KX-11204",
    totalPaid: 14,
    startTime: new Date("2026-09-14T18:00:00+04:00")
  }
];

export default function Profile() {
  const [activeMainTab, setActiveMainTab] = useState('personal'); // 'personal' or 'tickets'
  const [activeTicketTab, setActiveTicketTab] = useState('upcoming'); // 'upcoming' or 'past'
  
  const [upcomingTickets, setUpcomingTickets] = useState(mockUpcomingTickets);

  // Form States
  const [fullName, setFullName] = useState('Meri Sanikidze');
  const [email] = useState('merisanikidze@gmail.com'); // Read-only
  const [mobile, setMobile] = useState('555123456');
  const [dob, setDob] = useState('');
  const [venue, setVenue] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Validation States
  const [errors, setErrors] = useState({});
  const [age, setAge] = useState(null);
  const [isFormModified, setIsFormModified] = useState(false);

  useEffect(() => {
    validateForm();
  }, [fullName, mobile, dob]);

  const calculateAge = (dobString) => {
    if (!dobString) return null;
    const birthDate = new Date(dobString);
    const today = new Date();
    if (birthDate > today) return -1; 
    let calcAge = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      calcAge--;
    }
    return calcAge;
  };

  const validateForm = () => {
    const newErrors = {};
    let currentAge = calculateAge(dob);
    setAge(currentAge);

    // Full Name Validation
    if (!fullName) newErrors.fullName = "Name is required";
    else if (fullName.length < 3) newErrors.fullName = "Name must be at least 3 characters";
    else if (fullName.length > 50) newErrors.fullName = "Name must not exceed 50 characters";

    // Mobile Validation
    if (!mobile) {
      newErrors.mobile = "Mobile number is required";
    } else if (!mobile.startsWith('5')) {
      newErrors.mobile = "Georgian mobile numbers must start with 5";
    } else if (mobile.length !== 9) {
      newErrors.mobile = "Mobile number must be exactly 9 digits";
    } else if (!/^5\d{8}$/.test(mobile)) {
      newErrors.mobile = "Please enter a valid Georgian mobile number (9 digits starting with 5)";
    }

    // DOB Validation
    if (!dob) {
      newErrors.dob = "Date of birth is required";
    } else if (currentAge === -1) {
      newErrors.dob = "Please enter a valid date of birth";
    } else if (currentAge < 12) {
      newErrors.dob = "You must be at least 12 years old to create an account";
    }

    setErrors(newErrors);
  };

  const handleSave = () => {
    if (Object.keys(errors).length > 0) return;
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsFormModified(false);
    }, 1000);
  };

  const handleRefund = (id) => {
    setUpcomingTickets(upcomingTickets.filter(t => t.id !== id));
  };

  const renderTicketCard = (ticket, isPast) => {
    const now = new Date("2026-10-06T19:18:00+04:00"); // Simulated current time from context
    const hoursUntilStart = (ticket.startTime - now) / (1000 * 60 * 60);
    const canRefund = hoursUntilStart >= 2;

    const refundDeadline = new Date(ticket.startTime);
    refundDeadline.setHours(refundDeadline.getHours() - 2);
    const deadlineStr = `${refundDeadline.getHours().toString().padStart(2, '0')}:${refundDeadline.getMinutes().toString().padStart(2, '0')}, ${refundDeadline.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}`;

    return (
      <div key={ticket.id} className="ticket-card">
        <img src={ticket.poster} alt={ticket.title} className="ticket-poster" />
        
        <div className="ticket-details">
          <div className="ticket-header">
            <h3>{ticket.title}</h3>
            <span className="ticket-age-tag">{ticket.ageRating}</span>
            <span className="ticket-duration">{ticket.duration}</span>
          </div>
          
          <div className="ticket-meta-grid">
            <div>
              <p className="meta-label">DATE</p>
              <p className="meta-value">{ticket.dateStr}</p>
            </div>
            <div>
              <p className="meta-label">VENUE</p>
              <p className="meta-value">{ticket.venue}</p>
            </div>
            <div>
              <p className="meta-label">FORMAT</p>
              <p className="meta-value">{ticket.format}</p>
            </div>
          </div>
          
          <div className="ticket-seats">
            <p className="meta-label">SEATS</p>
            <div className="seat-list">
              {ticket.seats.map((seat, i) => <span key={i} className="seat-badge">{seat}</span>)}
            </div>
          </div>
        </div>

        <div className="ticket-actions">
          <div className="order-info">
            <p className="meta-label">ORDER</p>
            <p className="order-number">{ticket.orderNum}</p>
          </div>
          <div className="price-info">
            <p className="meta-label">Total paid</p>
            <p className="total-price">₾{ticket.totalPaid}</p>
          </div>
          {!isPast && (
            <div className="refund-section">
              <button 
                className={`btn-refund ${!canRefund ? 'btn-disabled' : ''}`}
                disabled={!canRefund}
                onClick={() => handleRefund(ticket.id)}
              >
                Refund
              </button>
              <p className="refund-policy">
                {canRefund ? `Refundable until ${deadlineStr}` : 'Refund window closed (less than 2 hours to start)'}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h1 className="page-title">My Profile</h1>
        
        {/* Main Tabs */}
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
            My Tickets <span className="ticket-count">{upcomingTickets.length}</span>
          </button>
        </div>

        {/* Tab Content: Personal Information */}
        {activeMainTab === 'personal' && (
          <div className="tab-content personal-form">
            <div className="form-group">
              <label>Full name</label>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); setIsFormModified(true); }}
                className={errors.fullName ? 'input-error' : ''}
              />
              {errors.fullName && <span className="error-text">{errors.fullName}</span>}
            </div>

            <div className="form-group">
              <label>Email</label>
              <input type="email" value={email} disabled className="input-disabled" />
              <span className="helper-text">Set at registration and cannot be changed</span>
            </div>

            <div className="form-group">
              <label>Mobile number</label>
              <input 
                type="text" 
                value={mobile}
                onChange={(e) => { setMobile(e.target.value); setIsFormModified(true); }}
                className={errors.mobile ? 'input-error' : ''}
              />
              {errors.mobile && <span className="error-text">{errors.mobile}</span>}
            </div>

            <div className="form-group">
              <label>Date of birth</label>
              <input 
                type="date" 
                value={dob}
                onChange={(e) => { setDob(e.target.value); setIsFormModified(true); }}
                className={errors.dob ? 'input-error' : ''}
              />
              {errors.dob && <span className="error-text">{errors.dob}</span>}
              {age !== null && age < 16 && age >= 12 && !errors.dob && (
                <span className="warning-text">Note: you cannot buy tickets for 16+ or 18+ titles.</span>
              )}
            </div>

            <div className="form-group">
              <label>Preferred Venue (Optional)</label>
              <select 
                value={venue} 
                onChange={(e) => { setVenue(e.target.value); setIsFormModified(true); }}
              >
                <option value="">Select a venue</option>
                <option value="Galleria Tbilisi">Galleria Tbilisi</option>
                <option value="Kutaisi Branch">Kutaisi Branch</option>
                <option value="Batumi Mall">Batumi Mall</option>
              </select>
            </div>

            <button 
              className={`btn-save ${(!isFormModified || Object.keys(errors).length > 0) ? 'disabled' : ''}`}
              onClick={handleSave}
              disabled={!isFormModified || Object.keys(errors).length > 0 || isSaving}
            >
              {isSaving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        )}

        {/* Tab Content: My Tickets */}
        {activeMainTab === 'tickets' && (
          <div className="tab-content tickets-section">
            <div className="ticket-subtabs">
              <button 
                className={`subtab-btn ${activeTicketTab === 'upcoming' ? 'active' : ''}`}
                onClick={() => setActiveTicketTab('upcoming')}
              >
                Upcoming <span className="subtab-count">{upcomingTickets.length}</span>
              </button>
              <button 
                className={`subtab-btn ${activeTicketTab === 'past' ? 'active' : ''}`}
                onClick={() => setActiveTicketTab('past')}
              >
                Past <span className="subtab-count">{mockPastTickets.length}</span>
              </button>
            </div>

            <div className="ticket-list">
              {activeTicketTab === 'upcoming' ? (
                upcomingTickets.length > 0 ? (
                  upcomingTickets.map(t => renderTicketCard(t, false))
                ) : (
                  <p className="no-tickets">You have no upcoming tickets.</p>
                )
              ) : (
                mockPastTickets.map(t => renderTicketCard(t, true))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}