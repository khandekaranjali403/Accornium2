import React from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import About from './pages/About';
import Contact from './pages/Contact';
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
}

function AppRouter() {
	return (
		<BrowserRouter>
			<App />
		</BrowserRouter>
	);
}

export default AppRouter;
