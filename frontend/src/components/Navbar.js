import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

function Navbar({ darkMode, onToggleTheme }) {
  const [open, setOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(
    () => Boolean(window.sessionStorage.getItem('finbank-token'))
  );
  const navigate = useNavigate();

  const logout = () => {
    window.sessionStorage.removeItem('finbank-token');
    setAuthenticated(false);
    setOpen(false);
    navigate('/');
  };

  const links = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/services', label: 'Services' },
    { to: '/portfolio', label: 'Portfolio' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <header className="navbar">
      <div className="navbar-inner container">
        <NavLink to="/" className="brand" onClick={() => setOpen(false)}>
          Accornium
        </NavLink>

        <button
          className="menu-toggle"
          aria-label="Toggle navigation"
          onClick={() => setOpen(!open)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`nav-links ${open ? 'open' : ''}`}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) => (isActive ? 'active' : '')}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
          {authenticated ? (
            <button className="nav-logout" type="button" onClick={logout}>Log out</button>
          ) : (
            <>
              <NavLink to="/login" onClick={() => setOpen(false)}>Log in</NavLink>
              <NavLink className="nav-signup" to="/signup" onClick={() => setOpen(false)}>
                Sign up
              </NavLink>
            </>
          )}
        </nav>
        <button
          className="theme-toggle"
          type="button"
          onClick={onToggleTheme}
          aria-label="Toggle dark mode"
          aria-pressed={darkMode}
          title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
        >
          <span aria-hidden="true">{darkMode ? '☀' : '☾'}</span>
        </button>
      </div>
    </header>
  );
}

export default Navbar;
