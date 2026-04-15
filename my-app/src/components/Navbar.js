import React, { useState } from 'react';

function Navbar({ onNavClick, onLoginClick, onRegisterClick, onSignOut, currentUserEmail, onMenuToggle, onProfileToggle }) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleProfileClick = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const handleSignOut = () => {
    setIsProfileMenuOpen(false);
    onSignOut();
  };

  return (
    <header className="navbar">
      <div className="nav-left">
        <button className="icon-btn menu-btn" type="button" onClick={onMenuToggle} aria-label="Open menu">
          <span />
          <span />
          <span />
        </button>
        <div className="logo">AI Study Planner</div>
      </div>
      <nav aria-label="Primary">
        <ul className="nav-list">
          <li>
            <button type="button" onClick={() => onNavClick('home')}>
              Home
            </button>
          </li>
          <li>
            <button type="button" onClick={() => onNavClick('features')}>
              Features
            </button>
          </li>
          <li>
            <button type="button" onClick={() => onNavClick('about')}>
              About
            </button>
          </li>
          {currentUserEmail ? (
            <>
              <li>
                <button type="button" onClick={handleSignOut}>
                  Sign Out
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <button type="button" onClick={onLoginClick}>
                  Login
                </button>
              </li>
              <li>
                <button type="button" onClick={onRegisterClick} className="btn-register">
                  Register
                </button>
              </li>
            </>
          )}
        </ul>
      </nav>

      {/* Profile Button with Dropdown */}
      <div className="profile-container">
        <button 
          className="icon-btn profile-btn" 
          type="button" 
          onClick={handleProfileClick} 
          aria-label="Profile menu"
          aria-expanded={isProfileMenuOpen}
        >
          {currentUserEmail ? currentUserEmail.charAt(0).toUpperCase() : 'P'}
        </button>

        {currentUserEmail && isProfileMenuOpen && (
          <div className="profile-dropdown">
            <div className="profile-dropdown-header">
              <span className="profile-email">{currentUserEmail}</span>
            </div>
            <button
              type="button"
              className="profile-dropdown-item"
              onClick={() => {
                setIsProfileMenuOpen(false);
                onProfileToggle();
              }}
            >
              📋 View Profile
            </button>
            <button
              type="button"
              className="profile-dropdown-item profile-dropdown-signout"
              onClick={handleSignOut}
            >
              🚪 Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;
