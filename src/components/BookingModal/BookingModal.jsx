import { useState, useEffect, Fragment, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchSessionSeats, holdSessionSeats, createOrder, fetchHold, releaseHold } from '../../api';
import './BookingModal.css';

export default function BookingModal({ session, onClose, filterOptions, currentUser }) {
  const [step, setStep] = useState(1);
  const [hallLayout, setHallLayout] = useState([]); 
  const [selectedSeats, setSelectedSeats] = useState([]);
  const navigate = useNavigate();
  
  const ticketTypes = filterOptions?.ticketTypes || [
    { slug: 'adult', name: 'Adult', ratio: 1 },
    { slug: 'student', name: 'Student', ratio: 0.75 },
    { slug: 'child', name: 'Child', ratio: 0.6 }
  ];
  const MAX_SEATS = filterOptions?.maxSeatsPerOrder || 3;
  
  const [holdToken, setHoldToken] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isLoadingSeats, setIsLoadingSeats] = useState(true);
  
  // Prefill user data from the profile
  const [form, setForm] = useState({
    fullName: currentUser?.fullName || '',
    email: currentUser?.email || '',
    mobile: currentUser?.mobileNumber || '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderResponse, setOrderResponse] = useState(null);

  const loadSeats = useCallback(async () => {
    setIsLoadingSeats(true);
    const data = await fetchSessionSeats(session.id);
    setHallLayout(data?.sections || []);
    setIsLoadingSeats(false);
  }, [session.id]);

  useEffect(() => {
    loadSeats();

    const recoverHold = async () => {
      const savedHoldId = sessionStorage.getItem(`activeHold_${session.id}`);
      if (savedHoldId) {
        const { status, data } = await fetchHold(savedHoldId);
        if (status === 200 && data?.data?.isLive) {
          const holdInfo = data.data;
          setHoldToken(holdInfo.holdId);
          setExpiresAt(holdInfo.expiresAt);
          
          const restoredSeats = holdInfo.seats.map(s => ({
            id: s.seatId,
            code: s.code,
            type: s.ticketType?.slug || 'adult',
            price: s.price
          }));
          
          setSelectedSeats(restoredSeats);
          setStep(2);
        } else {
          sessionStorage.removeItem(`activeHold_${session.id}`);
        }
      }
    };
    recoverHold();
  }, [loadSeats, session.id]);

  // Expiration Timer driven by expiresAt
  useEffect(() => {
    if (step !== 2 || !expiresAt) return;

    const tick = () => {
      const now = new Date();
      const expiry = new Date(expiresAt);
      const diffSeconds = Math.floor((expiry - now) / 1000);

      if (diffSeconds <= 0) {
        alert("Your hold time expired. Please re-select your seats.");
        setStep(1);
        setSelectedSeats([]);
        setExpiresAt(null);
        setHoldToken(null);
        sessionStorage.removeItem(`activeHold_${session.id}`);
        loadSeats(); 
      } else {
        setTimeRemaining(diffSeconds);
      }
    };

    tick(); 
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [step, expiresAt, loadSeats, session.id]);

  // Release hold on intentional modal close or explicit cancellation
  const handleClose = () => {
    if (holdToken && step < 3) {
      releaseHold(holdToken);
      sessionStorage.removeItem(`activeHold_${session.id}`);
    }
    onClose();
  };

  const toggleSeat = (seat) => {
    const isSelected = selectedSeats.find(s => s.id === seat.id);
    if (isSelected) {
      setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
    } else {
      if (selectedSeats.length >= MAX_SEATS) {
        alert(`Maximum ${MAX_SEATS} seats allowed per order.`);
        return;
      }
      setSelectedSeats([...selectedSeats, { 
        id: seat.id, 
        code: seat.code, 
        type: 'adult', 
      }]);
    }
  };

  const updateTicketType = (seatId, typeSlug) => {
    setSelectedSeats(seats => seats.map(s => 
      s.id === seatId ? { ...s, type: typeSlug } : s
    ));
  };

  const subtotal = selectedSeats.reduce((sum, seat) => {
    const tType = ticketTypes.find(t => t.slug === seat.type) || ticketTypes[0];
    const ratio = tType.ratio ?? 1;
    return sum + (session.price * ratio);
  }, 0);

  // POST /sessions/{id}/holds
  const handleHoldSeats = async () => {
    if (selectedSeats.length === 0) return;
    
    const holdPayload = {
      seats: selectedSeats.map(s => ({
        seatId: s.id,
        ticketType: s.type 
      }))
    };
    
    const { status, data } = await holdSessionSeats(session.id, holdPayload);
    
    if (status === 201) {
      const holdInfo = data.data || data;
      setHoldToken(holdInfo.holdId);
      setExpiresAt(holdInfo.expiresAt); 
      sessionStorage.setItem(`activeHold_${session.id}`, holdInfo.holdId);
      setStep(2);
    } else if (status === 401) {
      alert("Please log in to reserve seats.");
    } else if (status === 409) {
      // Reconcile contested seats
      const contested = data.contested || [];
      alert(`${data.message}\nSeats lost: ${contested.join(', ')}`);
      setSelectedSeats(prev => prev.filter(s => !contested.includes(s.code)));
      loadSeats();
    } else if (status === 422) {
      alert(data.message || "Booking rule validation failed.");
      if (data.message?.toLowerCase().includes("profile")) {
        onClose();
        navigate('/profile');
      }
    } else {
      alert("Failed to hold seats. Please try again.");
    }
  };

  const formatTime = (seconds) => {
    if (seconds === null || seconds <= 0) return '00:00';
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

// POST /orders
  const handleCheckout = async () => {
    setFormErrors({});
    setIsSubmitting(true);
    
    const orderPayload = {
      holdId: holdToken, 
      fullName: form.fullName,
      email: form.email,
      mobileNumber: form.mobile,
      cardNumber: form.cardNumber,
      expiration: form.expiry, 
      expiry: form.expiry,
      cvv: form.cvv
    };

    const { status, data } = await createOrder(orderPayload);
    setIsSubmitting(false);

    if (status === 201) {
      sessionStorage.removeItem(`activeHold_${session.id}`); 
      setOrderResponse(data.data || data);
      setStep(3);
    } else if (status === 422) {
      if (data.errors) {
        setFormErrors(data.errors);
        
        // Anti-Silent Failure: Force an alert so we can immediately see what Laravel is rejecting
        const allErrors = Object.values(data.errors).flat().join('\n');
        if (allErrors) {
          alert("Validation Failed:\n" + allErrors);
        }
      } else {
        alert(data.message); // Handle global rule rejections (e.g., Hold Expired)
        setStep(1);
        setSelectedSeats([]);
        setExpiresAt(null);
        setHoldToken(null);
        sessionStorage.removeItem(`activeHold_${session.id}`);
        loadSeats();
      }
    } else if (status === 409) {
      const contested = data.contested || [];
      alert(`Checkout failed. Seats sold elsewhere: ${contested.join(', ')}`);
      setSelectedSeats(prev => prev.filter(s => !contested.includes(s.code)));
      setStep(1);
      setExpiresAt(null);
      setHoldToken(null);
      sessionStorage.removeItem(`activeHold_${session.id}`);
      loadSeats();
    } else if (status === 403) {
      alert("This hold belongs to another account. Please restart your booking.");
      handleClose();
    } else {
      alert("Order placement failed. Please try again.");
    }
  };

  const minAge = parseInt(String(session.ageRating).replace(/\D/g, ''), 10) || 0;
  const allowChildTickets = minAge < 16;

  return (
    <div className="book-modal-overlay" onClick={handleClose}>
      <div className="book-modal-content" onClick={e => e.stopPropagation()}>
        
        {step < 3 && (
          <div className="book-header">
            <div>
              <h2 className="book-title">{session.movieTitle}</h2>
              <p className="book-subtitle">{session.venue} · {session.hall} · {session.time}</p>
            </div>
            {step === 2 && (
              <div className="timer-box">
                <span className="timer-label">SEATS HELD</span>
                <span className="timer-value">{formatTime(timeRemaining)}</span>
              </div>
            )}
          </div>
        )}

        {step < 3 && (
          <div className="step-indicator">
            <div 
              className={`step-item ${step === 1 ? 'active' : ''}`}
              onClick={() => step === 2 && setStep(1)} 
              style={{ cursor: step === 2 ? 'pointer' : 'default' }}
            >
              SEATS
            </div>
            <div className={`step-item ${step === 2 ? 'active' : ''}`}>CHECKOUT</div>
          </div>
        )}

        <div className="book-body">
          {/* STEP 1: SEATS */}
          {step === 1 && (
            <>
              <div className="hall-map-section">
                <div className="screen-indicator">SCREEN</div>
                
                {isLoadingSeats ? (
                   <p className="loading-text">Loading hall layout...</p>
                ) : (
                  <div className="seats-grid">
                    {hallLayout.map((section, secIndex) => (
                      <div key={secIndex} className="hall-section-group">
                        <div className="stalls-label">{section.name.toUpperCase()}</div>
                        
                        {section.rows.map((row) => (
                          <div key={row.label} className="seat-row">
                            <span className="row-label">{row.label}</span>
                            
                            {row.seats.map(seat => {
                              const isSelected = selectedSeats.some(s => s.id === seat.id);
                              
                              return (
                                <Fragment key={seat.id || `gap-${seat.code}`}>
                                  {seat.state === 'unavailable' ? (
                                    <span className="seat-unavailable"></span>
                                  ) : (
                                    <button
                                      className={`seat-btn ${seat.state !== 'available' && !seat.isMine ? seat.state : 'available'} ${isSelected ? 'selected' : ''}`}
                                      disabled={seat.state !== 'available'}
                                      onClick={() => toggleSeat(seat)}
                                    >
                                      {seat.label}
                                    </button>
                                  )}
                                  
                                  {seat.aisleAfter && (
                                    <span className="aisle-spacer"></span>
                                  )}
                                </Fragment>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="seat-legend" style={{ marginTop: '20px' }}>
                  <span><div className="legend-box available"></div> Available</span>
                  <span><div className="legend-box selected"></div> Selected</span>
                  <span><div className="legend-box held" style={{ backgroundColor: '#ff9800' }}></div> Held</span>
                  <span><div className="legend-box sold"></div> Sold</span>
                </div>
              </div>

              <div className="ticket-types-section">
                <h3>Your seats · Max {MAX_SEATS}</h3>
                {selectedSeats.length === 0 ? (
                  <p className="empty-seats">Pick up to {MAX_SEATS} seats from the map. Each seat can carry its own ticket type.</p>
                ) : (
                  <div className="selected-seats-list">
                    {selectedSeats.map(seat => {
                      const tType = ticketTypes.find(t => t.slug === seat.type) || ticketTypes[0];
                      const currentPrice = session.price * (tType.ratio ?? 1);
                      
                      return (
                        <div key={seat.id} className="seat-ticket-row">
                          <div className="seat-header">
                            <span className="seat-id">Seat <strong>{seat.code}</strong></span>
                            <div className="seat-price-remove">
                              <span className="seat-price-top">₾{currentPrice.toFixed(0)}</span>
                              <button className="btn-remove-seat" onClick={() => toggleSeat(seat)}>✕</button>
                            </div>
                          </div>
                          
                          <div className="seat-divider"></div>
                          
                          <div className="ticket-toggles">
                            {ticketTypes.map(type => {
                              if (type.slug === 'child' && !allowChildTickets) return null;
                              
                              return (
                                <button 
                                  key={type.slug}
                                  className={`type-btn ${seat.type === type.slug ? 'active' : ''}`}
                                  onClick={() => updateTicketType(seat.id, type.slug)}
                                >
                                  {type.name} {type.ratio < 1 ? `${type.ratio * 100}%` : '100%'}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )
                    })}
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
                    <input 
                      type="text" 
                      value={form.fullName} 
                      onChange={e => {
                        setForm({ ...form, fullName: e.target.value });
                        if (formErrors.fullName) setFormErrors({ ...formErrors, fullName: null });
                      }}
                      className={formErrors.fullName ? 'error' : 'input-filled'} 
                    />
                    {formErrors.fullName && <span className="error-text" style={{color: 'red', fontSize: '12px'}}>{Array.isArray(formErrors.fullName) ? formErrors.fullName[0] : formErrors.fullName}</span>}
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="input-group">
                    <label>Email</label>
                    <input 
                      type="email" 
                      value={form.email} 
                      onChange={e => {
                        setForm({ ...form, email: e.target.value });
                        if (formErrors.email) setFormErrors({ ...formErrors, email: null });
                      }}
                      className={formErrors.email ? 'error' : 'input-filled'} 
                    />
                    {formErrors.email && <span className="error-text" style={{color: 'red', fontSize: '12px'}}>{Array.isArray(formErrors.email) ? formErrors.email[0] : formErrors.email}</span>}
                  </div>
                  <div className="input-group">
                    <label>Mobile number</label>
                    <input 
                      type="text" 
                      value={form.mobile} 
                      onChange={e => {
                        setForm({ ...form, mobile: e.target.value });
                        if (formErrors.mobileNumber) setFormErrors({ ...formErrors, mobileNumber: null });
                      }}
                      className={formErrors.mobileNumber ? 'error' : 'input-filled'} 
                    />
                    {formErrors.mobileNumber && <span className="error-text" style={{color: 'red', fontSize: '12px'}}>{Array.isArray(formErrors.mobileNumber) ? formErrors.mobileNumber[0] : formErrors.mobileNumber}</span>}
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="input-group">
                    <label>Card number</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 4242 4242 4242 4242" 
                      value={form.cardNumber}
                      onChange={e => {
                        setForm({ ...form, cardNumber: e.target.value });
                        if (formErrors.cardNumber) setFormErrors({ ...formErrors, cardNumber: null });
                      }}
                      className={formErrors.cardNumber ? 'error' : ''}
                      autoComplete="off"
                    />
                    {formErrors.cardNumber && <span className="error-text" style={{color: 'red', fontSize: '12px'}}>{Array.isArray(formErrors.cardNumber) ? formErrors.cardNumber[0] : formErrors.cardNumber}</span>}
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="input-group">
                    <label>Expiry</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 12/34" 
                      value={form.expiry}
                      onChange={e => {
                        setForm({ ...form, expiry: e.target.value });
                        if (formErrors.expiration) setFormErrors({ ...formErrors, expiration: null });
                        if (formErrors.expiry) setFormErrors({ ...formErrors, expiry: null });
                      }}
                      className={(formErrors.expiration || formErrors.expiry) ? 'error' : ''}
                      autoComplete="off"
                    />
                    {(formErrors.expiration || formErrors.expiry) && <span className="error-text" style={{color: 'red', fontSize: '12px'}}>{Array.isArray(formErrors.expiration || formErrors.expiry) ? (formErrors.expiration || formErrors.expiry)[0] : (formErrors.expiration || formErrors.expiry)}</span>}
                  </div>
                  <div className="input-group">
                    <label>CVV</label>
                    <input 
                      type="password" 
                      placeholder="e.g. 123" 
                      value={form.cvv}
                      onChange={e => {
                        setForm({ ...form, cvv: e.target.value });
                        if (formErrors.cvv) setFormErrors({ ...formErrors, cvv: null });
                      }}
                      className={formErrors.cvv ? 'error' : ''}
                      autoComplete="new-password"
                    />
                    {formErrors.cvv && <span className="error-text" style={{color: 'red', fontSize: '12px'}}>{Array.isArray(formErrors.cvv) ? formErrors.cvv[0] : formErrors.cvv}</span>}
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
                    <span className="sum-value">{selectedSeats.map(s => s.code).join(', ')}</span>
                  </div>
                  <div className="sum-row">
                    <span className="sum-label">Tickets</span>
                    <span className="sum-value">
                      {Object.entries(
                        selectedSeats.reduce((acc, seat) => {
                          const name = ticketTypes.find(t => t.slug === seat.type)?.name || 'Adult';
                          acc[name] = (acc[name] || 0) + 1;
                          return acc;
                        }, {})
                      ).map(([name, count]) => `${count} x ${name}`).join(', ')}
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
              
              <div className="order-badge">ORDER #{orderResponse?.reference || 'KX-48291'}</div>
              
              <div className="success-actions" style={{marginTop: "30px"}}>
                <button className="btn-primary" onClick={() => { handleClose(); navigate('/profile', { state: { activeTab: 'tickets' } }); }}>View my tickets</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}