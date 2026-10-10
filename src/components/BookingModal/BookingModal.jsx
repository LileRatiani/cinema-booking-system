import { useState, useEffect } from 'react';
import { fetchSessionSeats, holdSessionSeats, createOrder } from '../../api';
import './BookingModal.css';

export default function BookingModal({ session, onClose }) {
  const [step, setStep] = useState(1); // 1: Seats, 2: Checkout, 3: Success
  const [hallLayout, setHallLayout] = useState({ rows: [] });
  const [selectedSeats, setSelectedSeats] = useState([]); // { id, number, type: 'Adult' | 'Child' | 'Student', price }
  const [holdToken, setHoldToken] = useState(null);
  const [holdTimer, setHoldTimer] = useState(null);
  
  // Checkout Form State
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
  const [orderResponse, setOrderResponse] = useState(null);

  // STEP 1: Fetch live seat layout when modal opens (GET /sessions/{id}/seats)
  useEffect(() => {
    const loadSeats = async () => {
      const data = await fetchSessionSeats(session.id);
      if (data) {
        setHallLayout(data);
      }
    };
    if (session?.id) {
      loadSeats();
    }
  }, [session?.id]);

  // Timer Logic for Holds
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
      setHoldToken(null);
    }
    return () => clearInterval(interval);
  }, [step, holdTimer]);

  const toggleSeat = (seat) => {
    const seatId = seat.id;
    const isSelected = selectedSeats.find(s => s.id === seatId);
    if (isSelected) {
      setSelectedSeats(selectedSeats.filter(s => s.id !== seatId));
    } else {
      if (selectedSeats.length >= 3) {
        alert("Maximum 3 seats allowed per order.");
        return;
      }
      setSelectedSeats([...selectedSeats, { 
        id: seatId, 
        number: seat.number || seat.seatNumber, 
        rowNumber: seat.rowNumber || seat.row,
        type: 'Adult', 
        price: session.price 
      }]);
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

  // STEP 2: Hold seats via POST /sessions/{id}/holds
  const handleHoldSeats = async () => {
    if (selectedSeats.length === 0) return;
    
    const seatIds = selectedSeats.map(s => s.id);
    const response = await holdSessionSeats(session.id, seatIds);
    
    if (response && (response.holdToken || response.token)) {
      setHoldToken(response.holdToken || response.token);
      setHoldTimer(response.expiresIn || 480); // Default to 8 mins (480s)
      setStep(2);
    } else {
      alert("Failed to hold selected seats. They might have just been taken.");
    }
  };

  const formatTime = (seconds) => {
    if (seconds === null) return '';
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // STEP 3: Create order via POST /orders
  const handleCheckout = async () => {
    const errors = {};
    if (form.cardNumber.replace(/\s/g, '').length !== 16) errors.cardNumber = "Invalid card length";
    if (!form.expiry.includes('/')) errors.expiry = "Use MM/YY format";
    if (form.cvv.length !== 3) errors.cvv = "Invalid CVV";
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    
    const orderPayload = {
      holdToken: holdToken,
      sessionId: session.id,
      seats: selectedSeats.map(s => ({ seatId: s.id, ticketType: s.type })),
      customer: {
        fullName: form.fullName,
        email: form.email,
        mobile: form.mobile
      },
      payment: {
        cardNumber: form.cardNumber,
        expiry: form.expiry,
        cvv: form.cvv
      }
    };

    const result = await createOrder(orderPayload);
    setIsSubmitting(false);

    if (result) {
      setOrderResponse(result);
      setStep(3); // Success
    } else {
      alert("Order placement failed. Please check your payment details.");
    }
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
                <div className="stalls-label">STALLS</div>
                
                <div className="seats-grid">
                  {hallLayout.rows?.map(row => (
                    <div key={row.id || row.rowNumber} className="seat-row">
                      <span className="row-label">{row.id || row.rowNumber}</span>
                      {row.seats?.map(seat => {
                        const isSelected = selectedSeats.some(s => s.id === seat.id);
                        const isTaken = seat.isBooked || seat.status === 'sold' || seat.status === 'booked';
                        const seatNum = seat.number || seat.seatNumber;
                        return (
                          <button
                            key={seat.id}
                            className={`seat-btn ${isTaken ? 'sold' : 'available'} ${isSelected ? 'selected' : ''} ${seatNum === 5 ? 'aisle-left' : ''}`}
                            disabled={isTaken}
                            onClick={() => toggleSeat(seat)}
                          >
                            {seatNum}
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
                          <span className="seat-id">Seat &nbsp;&nbsp;<strong>{seat.rowNumber}{seat.number}</strong></span>
                          <div className="seat-price-remove">
                            <span className="seat-price-top">₾{seat.price.toFixed(0)}</span>
                            <button className="btn-remove-seat" onClick={() => toggleSeat(seat)}>✕</button>
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
                  <p className="sum-meta">{session.hall} · {session.time}</p>
                  
                  <div className="seat-divider"></div>
                  
                  <div className="sum-row">
                    <span className="sum-label">Seats</span>
                    <span className="sum-value">{selectedSeats.map(s => `${s.rowNumber || ''}${s.number}`).join(', ')}</span>
                  </div>
                  <div className="sum-row">
                    <span className="sum-label">Tickets</span>
                    <span className="sum-value">
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
              
              <div className="order-badge">ORDER #{orderResponse?.id || orderResponse?.orderNumber || 'KX-48291'}</div>
              
              <div className="success-card">
                <div className="succ-header">
                  <div className="succ-header-info">
                    <h4>{session.movieTitle}</h4>
                    <p>{session.venue} · {session.hall} · {session.time}</p>
                  </div>
                </div>
                
                <div className="succ-row">
                  <span className="succ-label">Seats</span>
                  <span className="succ-value">{selectedSeats.map(s => `${s.rowNumber || ''}${s.number}`).join(', ')}</span>
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