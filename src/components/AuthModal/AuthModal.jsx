import { useState, useEffect } from 'react';
import './AuthModal.css';

export default function AuthModal({ isOpen, onClose, initialView = 'login' }) {
  const [view, setView] = useState(initialView);
  
  // Form States to simulate validation
  const [avatarUploaded, setAvatarUploaded] = useState(true);
  const [username, setUsername] = useState('User');
  const [email, setEmail] = useState(''); // Cleared default so button starts grey
  const [password, setPassword] = useState(''); // Cleared default
  const [confirmPassword, setConfirmPassword] = useState('');

  // Reset the view whenever the modal is opened
  useEffect(() => {
    if (isOpen) {
      setView(initialView);
    }
  }, [isOpen, initialView]);

  if (!isOpen) return null;

  // Validation Logic
  const isUsernameValid = username.length > 0;
  const isEmailValid = email.includes('@');
  const isPasswordValid = password.length > 0;
  const passwordsMatch = confirmPassword === password && confirmPassword.length > 0;
  const passwordError = confirmPassword.length > 0 && confirmPassword !== password;
  
  // The submit button becomes active if required fields are filled
  const isSignupValid = isUsernameValid && isEmailValid && isPasswordValid && passwordsMatch;
  const isLoginValid = isEmailValid && isPasswordValid;
  const isFormValid = view === 'login' ? isLoginValid : isSignupValid;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        <button className="close-btn" onClick={onClose}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 1L1 13M1 1L13 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <h2 className="modal-title">
          {view === 'login' ? 'Log in' : 'Sign up'}
        </h2>
        <p className="modal-subtitle">
          {view === 'login' 
            ? 'Welcome back to Kino XII' 
            : 'Welcome to Kino XII'}
        </p>

        <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
          
          {view === 'signup' && (
            <>
              <div className="avatar-upload-section">
                <div className="avatar-upload-btn" onClick={() => setAvatarUploaded(!avatarUploaded)}>
                  {avatarUploaded ? (
                    <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=8b5cf6" alt="Avatar" className="uploaded-avatar" />
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                  )}
                </div>
                <div className="avatar-text">
                  <p className="avatar-title">Upload avatar (optional)</p>
                  <p className="avatar-desc">JPG, PNG or WEBP</p>
                </div>
              </div>

              <div className="input-group">
                <label>Username</label>
                <div className="input-wrapper">
                  <input 
                    type="text" 
                    placeholder="User" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  {isUsernameValid && <span className="input-icon icon-success">✓</span>}
                </div>
              </div>
            </>
          )}
          
          <div className="input-group">
            <label>Email</label>
            <div className="input-wrapper">
              <input 
                type="email" 
                placeholder="example@gmail.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {isEmailValid && <span className="input-icon icon-success">✓</span>}
            </div>
          </div>

          {view === 'login' ? (
            <div className="input-group">
              <label>Password</label>
              <div className="input-wrapper">
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="input-row">
              <div className="input-group">
                <label>password</label>
                <div className="input-wrapper">
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {isPasswordValid && !passwordError && <span className="input-icon icon-success">✓</span>}
                </div>
              </div>
              <div className="input-group">
                <label className={passwordError ? 'label-error' : ''}>Confirm password</label>
                <div className="input-wrapper">
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={passwordError ? 'input-error' : ''}
                  />
                  {passwordsMatch && <span className="input-icon icon-success">✓</span>}
                  {passwordError && (
                    <span className="input-icon icon-error">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                    </span>
                  )}
                </div>
                {passwordError && <span className="error-message">Passwords do not match</span>}
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className={`btn-submit ${isFormValid ? 'btn-login-active' : 'btn-signup-grey'}`}
          >
            {view === 'login' ? 'Log in' : 'Sign up'}
          </button>
        </form>

        <div className="modal-footer">
          {view === 'login' ? (
            <p>Don't have an account? <span onClick={() => setView('signup')}>Sign up</span></p>
          ) : (
            <p>Already have an account? <span onClick={() => setView('login')}>Log in</span></p>
          )}
        </div>

      </div>
    </div>
  );
}