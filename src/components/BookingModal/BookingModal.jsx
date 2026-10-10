import { useState, useEffect, useMemo } from 'react';
import './BookingModal.css';

// Simulated API response for hall layout
const MOCK_HALL_LAYOUT = {
  rows: [
    { id: 'A', seats: Array.from({ length: 10 }, (_, i) => ({ id: `A${i + 1}`, number: i + 1, status: i === 4 ? 'sold' : 'available' })) },
    { id: 'B', seats: Array.from({ length: 10 }, (_, i) => ({ id: `B${i + 1}`, number: i + 1, status: (i === 1 || i === 2) ? 'held' : 'available' })) },
    { id: 'C', seats: Array.from({ length: 10 }, (_, i) => ({ id: `C${i + 1}`, number: i + 1, status: 'available' })) },
    { id: 'D', seats: Array.from({ length: 10 }, (_, i) => ({ id: `D${i + 1}`, number: i + 1, status: 'available' })) },
  ]
};

export default function BookingModal({ session, onClose }) {
  const [step, setStep] = useState(1); // 1: Seats, 2: Checkout, 3: Success
  const [selectedSeats, setSelectedSeats] = useState([]); // { id, type: 'Adult' | 'Child' | 'Student', price }
  const [holdTimer, setHoldTimer] = useState(null);
  
  // Checkout Form State (Mocked to match persona requested)
  const [form, setForm] = useState({
    fullName: 'Meri Sanikidze',
    email: 'merisanikidze@gmail.com',
    mobile: '555123456',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Timer Logic
  useEffect(() => {
    let interval;
    if (step === 2 && holdTimer > 0) {
      interval = setInterval(() => {
        setHoldTimer((prev) => prev - 1);
      }, 1000);
    } else if (holdTimer === 0 && step === 2) {
      alert("Your hold time expired. Please re-select your seats.");
      setStep(1);
      setSelectedSeats([]);
      setHoldTimer(null);
    }
    return () => clearInterval(interval);
  }, [step, holdTimer]);

  const toggleSeat = (seatId) => {
    const isSelected = selectedSeats.find(s => s.id === seatId);
    if (isSelected) {
      setSelectedSeats(selectedSeats.filter(s => s.id !== seatId));
    } else {
      if (selectedSeats.length >= 3) {
        alert("Maximum 3 seats allowed per order.");
        return;
      }
      setSelectedSeats([...selectedSeats, { id: seatId, type: 'Adult', price: session.price }]);
    }
  };

  const updateTicketType = (seatId, type) => {
    if (type === 'Child' && (session.ageRating === '16+' || session.ageRating === '18+')) {
      alert(`Child tickets are not permitted for ${session.ageRating} titles.`);
      return;
    }
    
    let multiplier = 1;
    if (type === 'Child') multiplier = 0.6;
    if (type === 'Student') multiplier = 0.75;
    
    setSelectedSeats(seats => seats.map(s => 
      s.id === seatId ? { ...s, type, price: session.price * multiplier } : s
    ));
  };

  const subtotal = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  const handleHoldSeats = () => {
    if (selectedSeats.length === 0) return;
    // Simulate API Hold Request
    setHoldTimer(480); // 8 minutes = 480 seconds
    setStep(2);
  };

  const formatTime = (seconds) => {
    if (seconds === null) return '';
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleCheckout = () => {
    const errors = {};
    if (form.cardNumber.replace(/\s/g, '').length !== 16) errors.cardNumber = "Invalid card length";
    if (!form.expiry.includes('/')) errors.expiry = "Use MM/YY format";
    if (form.cvv.length !== 3) errors.cvv = "Invalid CVV";
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep(3); // Success
    }, 1500);
  };

  return (
    <div className="book-modal-overlay" onClick={onClose}>
      <div className="book-modal-content" onClick={e => e.stopPropagation()}>
        
        {step < 3 && (
          <div className="book-header">
            <div>
              <h2 className="book-title">{session.movieTitle}</h2>
              <p className="book-subtitle">{session.venue} · {session.hall} · {session.time} · {session.format} · {session.lang}</p>
            </div>
            {step === 2 && (
              <div className="timer-box">
                <span className="timer-label">SEATS HELD</span>
                <span className="timer-value">{formatTime(holdTimer)}</span>
              </div>
            )}
          </div>
        )}

        {step < 3 && (
          <div className="step-indicator">
            <div className={`step-item ${step === 1 ? 'active' : ''}`}>SEATS</div>
            <div className={`step-item ${step === 2 ? 'active' : ''}`}>CHECKOUT</div>
          </div>
        )}

        <div className="book-body">
          {/* STEP 1: SEATS */}
          {step === 1 && (
            <>
              <div className="hall-map-section">
                <div className="screen-indicator">SCREEN</div>
                
                {/* NEW: Stalls Label */}
                <div className="stalls-label">STALLS · ROWS A-D</div>
                
                <div className="seats-grid">
                  {MOCK_HALL_LAYOUT.rows.map(row => (
                    <div key={row.id} className="seat-row">
                      <span className="row-label">{row.id}</span>
                      {row.seats.map(seat => {
                        const isSelected = selectedSeats.some(s => s.id === seat.id);
                        return (
                          <button
                            key={seat.id}
                            // NEW: Adding 'aisle-left' class to seat #5 to create the gap
                            className={`seat-btn ${seat.status} ${isSelected ? 'selected' : ''} ${seat.number === 5 ? 'aisle-left' : ''}`}
                            disabled={seat.status !== 'available'}
                            onClick={() => toggleSeat(seat.id)}
                          >
                            {seat.number}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
                <div className="seat-legend">
                  <span><div className="legend-box available"></div> Available</span>
                  <span><div className="legend-box selected"></div> Selected</span>
                  <span><div className="legend-box sold"></div> Sold</span>
                  <span><div className="legend-box held"></div> Held by another user</span>
                </div>
              </div>

              <div className="ticket-types-section">
                <h3>Your seats · Max 3</h3>
                {selectedSeats.length === 0 ? (
                  <p className="empty-seats">Pick up to 3 seats from the map. Each seat can carry its own ticket type.</p>
                ) : (
                  <div className="selected-seats-list">
                    {selectedSeats.map(seat => (
                      <div key={seat.id} className="seat-ticket-row">
                        <div className="seat-header">
                          <span className="seat-id">Seat &nbsp;&nbsp;<strong>{seat.id}</strong></span>
                          <div className="seat-price-remove">
                            <span className="seat-price-top">₾{seat.price.toFixed(0)}</span>
                            <button 
                              className="btn-remove-seat" 
                              onClick={() => toggleSeat(seat.id)}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                        
                        <div className="seat-divider"></div>
                        
                        <div className="ticket-toggles">
                          {['Child', 'Student', 'Adult'].map(type => (
                            <button 
                              key={type}
                              className={`type-btn ${seat.type === type ? 'active' : ''}`}
                              onClick={() => updateTicketType(seat.id, type)}
                            >
                              {type} {type === 'Child' ? '60%' : type === 'Student' ? '75%' : '100%'}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="subtotal-bar">
                  <span>SUBTOTAL</span>
                  <span className="subtotal-amount">₾{subtotal.toFixed(2)}</span>
                </div>
                <button 
                  className="btn-next" 
                  disabled={selectedSeats.length === 0}
                  onClick={handleHoldSeats}
                >
                  Next: Checkout
                </button>
              </div>
            </>
          )}

          {/* STEP 2: CHECKOUT */}
          {step === 2 && (
            <>
              <div className="checkout-form">
                <div className="form-row">
                  <div className="input-group">
                    <label>Full name</label>
                    <input type="text" value={form.fullName} readOnly className="input-filled" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="input-group">
                    <label>Email</label>
                    <input type="email" value={form.email} readOnly className="input-filled" />
                  </div>
                  <div className="input-group">
                    <label>Mobile number</label>
                    <input type="text" value={form.mobile} readOnly className="input-filled" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="input-group">
                    <label>Card number</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 1234 4567 8901 2345" 
                      value={form.cardNumber}
                      onChange={e => setForm({ ...form, cardNumber: e.target.value })}
                      className={formErrors.cardNumber ? 'error' : ''}
                      autoComplete="off"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="input-group">
                    <label>Expiry</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 12/34" 
                      value={form.expiry}
                      onChange={e => setForm({ ...form, expiry: e.target.value })}
                      className={formErrors.expiry ? 'error' : ''}
                      autoComplete="off"
                    />
                  </div>
                  <div className="input-group">
                    <label>CVV</label>
                    <input 
                      type="password" 
                      placeholder="e.g. 123" 
                      value={form.cvv}
                      onChange={e => setForm({ ...form, cvv: e.target.value })}
                      className={formErrors.cvv ? 'error' : ''}
                      autoComplete="new-password"
                    />
                  </div>
                </div>
              </div>

              <div className="checkout-summary">
                <h3>Summary</h3>
                <div className="summary-card">
                  <h4>{session.movieTitle}</h4>
                  <p className="sum-meta">{session.hall} · Tue 15 Sep · {session.time}</p>
                  
                  <div className="seat-divider"></div>
                  
                  <div className="sum-row">
                    <span className="sum-label">Seats</span>
                    <span className="sum-value">{selectedSeats.map(s => s.id).join(', ')}</span>
                  </div>
                  <div className="sum-row">
                    <span className="sum-label">Tickets</span>
                    <span className="sum-value">
                      {/* Dynamically count ticket types for the summary */}
                      {Object.entries(
                        selectedSeats.reduce((acc, seat) => {
                          acc[seat.type] = (acc[seat.type] || 0) + 1;
                          return acc;
                        }, {})
                      ).map(([type, count]) => `${count} x ${type}`).join(', ')}
                    </span>
                  </div>
                </div>
                
                <div className="subtotal-bar">
                  <span>SUBTOTAL</span>
                  <span className="subtotal-amount">₾{subtotal.toFixed(0)}</span>
                </div>
                <button 
                  className="btn-next" 
                  onClick={handleCheckout}
                  /* Disables the button if any input is empty OR if the form is submitting */
                  disabled={!form.cardNumber || !form.expiry || !form.cvv || isSubmitting} 
                >
                  {isSubmitting ? 'Processing...' : 'Pay & Complete order'}
                </button>
              </div>
            </>
          )}

          {/* STEP 3: SUCCESS */}
          {step === 3 && (
            <div className="success-view">
              <div className="success-icon">✓</div>
              <h2>Booking confirmed!</h2>
              <p>Your tickets are ready. We've sent the confirmation to your email.</p>
              
              <div className="order-badge">ORDER #KX-48291</div>
              
              <div className="success-card">
                <div className="succ-header">
                  {/* Using a placeholder poster image to prevent crashes since MOVIE_DATA isn't imported here */}
                  <img src="https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=400&auto=format&fit=crop" alt="Poster" />
                  <div className="succ-header-info">
                    <h4>{session.movieTitle}</h4>
                    <p>{session.venue} · {session.hall} · Tue 15 Sep · {session.time}</p>
                  </div>
                </div>
                
                <div className="succ-row">
                  <span className="succ-label">Seats</span>
                  <span className="succ-value">{selectedSeats.map(s => s.id).join(', ')}</span>
                </div>
                
                <div className="succ-row">
                  <span className="succ-label">Tickets</span>
                  <span className="succ-value">
                    {Object.entries(
                      selectedSeats.reduce((acc, seat) => {
                        acc[seat.type] = (acc[seat.type] || 0) + 1;
                        return acc;
                      }, {})
                    ).map(([type, count]) => `${count} x ${type}`).join(', ')}
                  </span>
                </div>
                
                <div className="succ-row total">
                  <span className="succ-label">TOTAL PAID</span>
                  <span className="succ-value-large">₾{subtotal.toFixed(0)}</span>
                </div>
              </div>
              
              <div className="success-actions">
                <button className="btn-primary" onClick={onClose}>View my tickets</button>
                <button className="btn-secondary" onClick={onClose}>Back to home</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}