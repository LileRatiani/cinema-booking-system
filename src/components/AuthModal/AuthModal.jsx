import { useState, useEffect, useRef } from 'react';
import { registerAccount, loginUser } from '../../api'; // Adjust path as needed
import './AuthModal.css';

export default function AuthModal({ isOpen, onClose, initialView = 'login', onAuthSuccess }) {
  const [view, setView] = useState(initialView);
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Real File State
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);

  // API States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState({});
  const [authError, setAuthError] = useState(null); // NEW: State for 401 login errors

  useEffect(() => {
    if (isOpen) {
      setView(initialView);
      setServerErrors({});
      setAuthError(null); // Clear errors when modal opens
    }
  }, [isOpen, initialView]);

  if (!isOpen) return null;

  // Validation Logic
  const isUsernameValid = username.length > 0;
  const isEmailValid = email.includes('@');
  const isPasswordValid = password.length > 0;
  const passwordsMatch = confirmPassword === password && confirmPassword.length > 0;
  const passwordError = confirmPassword.length > 0 && confirmPassword !== password;
  
  const isSignupValid = isUsernameValid && isEmailValid && isPasswordValid && passwordsMatch;
  const isLoginValid = isEmailValid && isPasswordValid;
  const isFormValid = view === 'login' ? isLoginValid : isSignupValid;

  // Handle Real File Upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    setIsSubmitting(true);
    setServerErrors({});
    setAuthError(null); // Clear previous errors

    if (view === 'signup') {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('password_confirmation', confirmPassword);
      if (avatarFile) formData.append('avatar', avatarFile);

      const { status, data } = await registerAccount(formData);
      
      if (status === 201) {
        localStorage.setItem('token', data.data.token);
        alert("Account created! Please complete your profile before booking.");
        if (onAuthSuccess) onAuthSuccess(data.data.user);
        onClose();
      } else if (status === 422) {
        setServerErrors(data.errors || {});
      } else {
        alert(data.message || "Registration failed.");
      }
    } else {
      // Login Logic
      const { status, data } = await loginUser({ email, password });
      
      if (status === 200 || status === 201) { 
        localStorage.setItem('token', data.data ? data.data.token : data.token);
        if (onAuthSuccess) onAuthSuccess(data.data?.user);
        onClose();
      } else if (status === 401) {
        // 401: Wrong credentials. Show inline error, clear password, keep email!
        setAuthError(data.message || "Invalid credentials.");
        setPassword(''); 
      } else if (status === 422) {
        setServerErrors(data.errors || {});
      } else {
        setAuthError(data.message || "An unexpected error occurred.");
      }
    }
    
    setIsSubmitting(false);
  };

  // Helper to get error text
  const getError = (field) => serverErrors[field] ? serverErrors[field][0] : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        <button className="close-btn" onClick={onClose}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 1L1 13M1 1L13 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <h2 className="modal-title">{view === 'login' ? 'Log in' : 'Sign up'}</h2>
        <p className="modal-subtitle">{view === 'login' ? 'Welcome back to Kino XII' : 'Welcome to Kino XII'}</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          
          {view === 'signup' && (
            <>
              <div className="avatar-upload-section">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".jpg,.jpeg,.png,.webp" 
                  style={{ display: 'none' }} 
                />
                <div className="avatar-upload-btn" onClick={() => fileInputRef.current?.click()}>
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="uploaded-avatar" style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}} />
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
                  <p className="avatar-desc">JPG, PNG or WEBP. Max 2MB</p>
                </div>
              </div>
              {getError('avatar') && <span className="error-message">{getError('avatar')}</span>}

              <div className="input-group">
                <label>Username</label>
                <div className="input-wrapper">
                  <input 
                    type="text" 
                    placeholder="User" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  {isUsernameValid && !getError('username') && <span className="input-icon icon-success">✓</span>}
                </div>
                {getError('username') && <span className="error-message">{getError('username')}</span>}
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
              {isEmailValid && !getError('email') && <span className="input-icon icon-success">✓</span>}
            </div>
            {getError('email') && <span className="error-message">{getError('email')}</span>}
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
                  className={authError ? 'input-error' : ''} // NEW: Highlight red on 401
                />
              </div>
              {getError('password') && <span className="error-message">{getError('password')}</span>}
            </div>
          ) : (
            <div className="input-row">
              <div className="input-group">
                <label>Password</label>
                <div className="input-wrapper">
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {isPasswordValid && !passwordError && !getError('password') && <span className="input-icon icon-success">✓</span>}
                </div>
                {getError('password') && <span className="error-message">{getError('password')}</span>}
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

          {/* NEW: Inline Error Banner for 401s */}
          {authError && (
            <div className="auth-error-banner" style={{ color: '#ef4444', fontSize: '14px', marginBottom: '16px', textAlign: 'center' }}>
              {authError}
            </div>
          )}

          <button 
            type="submit" 
            disabled={!isFormValid || isSubmitting}
            className={`btn-submit ${isFormValid ? 'btn-login-active' : 'btn-signup-grey'}`}
          >
            {isSubmitting ? 'Processing...' : (view === 'login' ? 'Log in' : 'Sign up')}
          </button>
        </form>

        <div className="modal-footer">
          {view === 'login' ? (
            <p>Don't have an account? <span onClick={() => { setView('signup'); setServerErrors({}); setAuthError(null); }}>Sign up</span></p>
          ) : (
            <p>Already have an account? <span onClick={() => { setView('login'); setServerErrors({}); setAuthError(null); }}>Log in</span></p>
          )}
        </div>

      </div>
    </div>
  );
}