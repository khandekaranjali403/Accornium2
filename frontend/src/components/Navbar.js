import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

function Navbar() {
  const [open, setOpen] = useState(false);

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
          <NavLink className="nav-login" to="/login" onClick={() => setOpen(false)}>
            Login
          </NavLink>
          <NavLink className="nav-signup" to="/signup" onClick={() => setOpen(false)}>
            Sign Up
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
