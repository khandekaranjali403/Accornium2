import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthPages from './pages/AuthPages';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Portfolio from './pages/Portfolio';
import Contact from './pages/Contact';
import FinBankDashboard from './pages/FinBankDashboard';

function AppContent({ darkMode, onToggleTheme }) {
  const location = useLocation();
  const isAuthPage = ['/login', '/signup', '/verify-email', '/session-expired'].includes(location.pathname);
  const isFinBankPage = location.pathname === '/finbank';
  const isAuthenticated = Boolean(window.sessionStorage.getItem('finbank-token'));

  return (
    <div className="app-shell" data-theme={darkMode ? 'dark' : 'light'}>
      {!isAuthPage && !isFinBankPage && <Navbar darkMode={darkMode} onToggleTheme={onToggleTheme} />}
      <main key={location.pathname} className="page-transition">
        <Routes>
          <Route
            path="/finbank"
            element={isAuthenticated ? <FinBankDashboard darkMode={darkMode} onToggleTheme={onToggleTheme} /> : <Navigate to="/login" replace />}
          />
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/signup" element={<AuthPages page="signup" darkMode={darkMode} onToggleTheme={onToggleTheme} />} />
          <Route path="/login" element={<AuthPages page="login" darkMode={darkMode} onToggleTheme={onToggleTheme} />} />
          <Route path="/verify-email" element={<AuthPages page="verify" darkMode={darkMode} onToggleTheme={onToggleTheme} />} />
          <Route path="/session-expired" element={<AuthPages page="logged-out" darkMode={darkMode} onToggleTheme={onToggleTheme} />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      {!isAuthPage && !isFinBankPage && <Footer />}
    </div>
  );
}

function App() {
  const [darkMode, setDarkMode] = useState(() => window.localStorage.getItem('finbank-theme') === 'dark');

  useEffect(() => {
    const theme = darkMode ? 'dark' : 'light';
    window.localStorage.setItem('finbank-theme', theme);
    document.documentElement.dataset.theme = theme;
  }, [darkMode]);

  return (
    <BrowserRouter>
      <AppContent darkMode={darkMode} onToggleTheme={() => setDarkMode((current) => !current)} />
    </BrowserRouter>
  );
}

export default App;
