<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthPages from './pages/AuthPages';
import Home from './pages/Home';
=======
import React from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
>>>>>>> origin/master
import About from './pages/About';
import Contact from './pages/Contact';
<<<<<<< HEAD
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
=======
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import OtpVerification from './pages/OtpVerification';
import Portfolio from './pages/Portfolio';
import Services from './pages/Services';
import Signup from './pages/Signup';
import { Accounts, Cards, Loans, Payments, Profile, SessionExpired, Statements, Transactions, Transfer } from './pages/BankingPages';

function App() {
	const location = useLocation();
	const isBankingPage = ['/dashboard', '/accounts', '/transactions', '/transfer', '/payments', '/cards', '/loans', '/statements', '/profile', '/logout'].includes(location.pathname);

	return (
			<div className="app-shell">
				{!isBankingPage && <Navbar />}
				<main>
					<Routes>
						<Route path="/" element={<Home />} />
						<Route path="/dashboard" element={<Dashboard />} />
						<Route path="/accounts" element={<Accounts />} />
						<Route path="/transactions" element={<Transactions />} />
						<Route path="/transfer" element={<Transfer />} />
						<Route path="/payments" element={<Payments />} />
						<Route path="/cards" element={<Cards />} />
						<Route path="/loans" element={<Loans />} />
						<Route path="/statements" element={<Statements />} />
						<Route path="/profile" element={<Profile />} />
						<Route path="/logout" element={<SessionExpired />} />
						<Route path="/about" element={<About />} />
						<Route path="/services" element={<Services />} />
						<Route path="/portfolio" element={<Portfolio />} />
						<Route path="/contact" element={<Contact />} />
						<Route path="/login" element={<Login />} />
						<Route path="/signup" element={<Signup />} />
						<Route path="/verify-otp" element={<OtpVerification />} />
					</Routes>
				</main>
				{!isBankingPage && <Footer />}
			</div>
	);
>>>>>>> origin/master
}

function AppRouter() {
	return (
		<BrowserRouter>
			<App />
		</BrowserRouter>
	);
}

export default AppRouter;
