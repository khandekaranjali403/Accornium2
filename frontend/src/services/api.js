const API_BASE_URL = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '');
const AUTH_TOKEN_KEY = 'finbank.authToken';

export const mockData = {
  home: {
    stats: [
      { value: '120+', label: 'Projects Delivered' },
      { value: '60+', label: 'Happy Clients' },
      { value: '8', label: 'Years of Experience' },
      { value: '25+', label: 'Engineers' },
    ],
    services: [
      { title: 'Web Development', desc: 'Responsive, high-performance web apps built with React and modern tooling.' },
      { title: 'Backend Engineering', desc: 'Robust APIs and microservices powered by Java Spring Boot.' },
      { title: 'Mobile Apps', desc: 'Cross-platform mobile experiences for iOS and Android.' },
      { title: 'Cloud & DevOps', desc: 'CI/CD pipelines, containerization, and cloud infrastructure on AWS, Azure, or GCP.' },
    ],
  },
  services: [
    { title: 'Custom Web Applications', desc: 'Responsive, accessible web apps built with React, TypeScript, and modern component architectures.' },
    { title: 'Backend & API Development', desc: 'Secure, scalable REST and GraphQL APIs built with Java Spring Boot, backed by robust data models.' },
    { title: 'Mobile App Development', desc: 'Native and cross-platform mobile apps for iOS and Android with smooth, native-feeling UX.' },
    { title: 'Cloud & DevOps', desc: 'CI/CD pipelines, container orchestration, and infrastructure-as-code on AWS, Azure, or GCP.' },
    { title: 'UI/UX Design', desc: 'Research-driven design systems and interfaces that are as usable as they are beautiful.' },
    { title: 'Product Consulting', desc: 'Technical strategy, architecture reviews, and roadmap planning for growing products.' },
  ],
  projects: [
    { title: 'FinTrack', category: 'FinTech · Web App', desc: 'A personal finance dashboard built with React and Spring Boot microservices.' },
    { title: 'MedConnect', category: 'HealthTech · Mobile', desc: 'Telemedicine platform connecting patients and doctors in real time.' },
    { title: 'ShopSphere', category: 'E-commerce · Web', desc: 'Headless commerce platform with a Java backend and React storefront.' },
    { title: 'LogiFlow', category: 'Logistics · SaaS', desc: 'Real-time fleet tracking and route optimization dashboard.' },
    { title: 'EduSpark', category: 'EdTech · Web App', desc: 'Learning management system serving 50,000+ students.' },
    { title: 'HireHub', category: 'HR Tech · SaaS', desc: 'Applicant tracking system with automated candidate scoring.' },
  ],
  values: [
    { title: 'Quality First', desc: 'We write clean, tested, maintainable code and stand behind it.' },
    { title: 'Transparency', desc: 'Clear communication and predictable delivery timelines.' },
    { title: 'Partnership', desc: 'We work as an extension of your team, not just a vendor.' },
  ],
  team: [
    { name: 'Aarav Sharma', role: 'Founder & CEO' },
    { name: 'Priya Nair', role: 'Head of Engineering' },
    { name: 'Rohan Mehta', role: 'Lead Backend Architect' },
    { name: 'Sara Khan', role: 'Lead Frontend Engineer' },
  ],
};

async function request(path, options = {}) {
  const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const responseText = await response.text();
    let responseBody;
    try {
      responseBody = responseText ? JSON.parse(responseText) : null;
    } catch (error) {
      responseBody = null;
    }
    const message = responseBody?.message || responseBody?.error || responseBody?.detail || responseText;
    if (response.status === 401) window.localStorage.removeItem(AUTH_TOKEN_KEY);
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) return null;

  const responseText = await response.text();
  if (!responseText) return null;
  try {
    return JSON.parse(responseText);
  } catch (error) {
    return responseText;
  }
}

function saveAuthResponse(response) {
  if (response?.token) window.localStorage.setItem(AUTH_TOKEN_KEY, response.token);
  return response;
}

const LOCAL_USER_KEY = 'accornium.localUser';

function isNetworkError(error) {
  return error instanceof TypeError || error.message === 'Failed to fetch';
}

function localSignup(payload) {
  const user = { name: payload.name, email: payload.email, password: payload.password };
  window.localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
  return { ok: true, requiresOtp: true };
}

function localLogin(payload) {
  const storedUser = window.localStorage.getItem(LOCAL_USER_KEY);
  const user = storedUser ? JSON.parse(storedUser) : null;
  if (!user || user.email !== payload.email || user.password !== payload.password) {
    throw new Error('No matching local account. Create an account first.');
  }
  return { ok: true, requiresOtp: true };
}

async function authRequest(path, payload, fallback) {
  try {
    return await request(path, { method: 'POST', body: JSON.stringify(payload) });
  } catch (error) {
    if (isNetworkError(error)) return fallback(payload);
    throw error;
  }
}

async function getWithFallback(path, fallback) {
  try {
    return await request(path);
  } catch (error) {
    return fallback;
  }
}

function formatAmount(value) {
  return Number(value || 0).toLocaleString('en-IN');
}

function normalizeDashboard(data) {
  if (!data) return null;
  const user = data.user || {};
  return {
    user: {
      ...user,
      initials: user.name ? user.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() : 'AS',
    },
    balance: { total: formatAmount(data.totalBalance), change: 'Live balance from your accounts' },
    accounts: (data.accounts || []).map((account) => ({
      label: `${String(account.type || 'Bank').replace('_', ' ')} Account`,
      value: formatAmount(account.balance),
      accent: 'blue',
    })),
    transactions: (data.recentTransactions || []).map((transaction) => ({
      name: transaction.description,
      date: transaction.transactionDate || 'Recent',
      amount: `${transaction.type === 'CREDIT' ? '+' : '-'}${formatAmount(transaction.amount)}`,
      type: transaction.type === 'CREDIT' ? 'credit' : 'debit',
      icon: String(transaction.description || 'T').charAt(0).toUpperCase(),
    })),
  };
}

export const api = {
  getHome: () => getWithFallback('/api/home', mockData.home),
  getServices: () => getWithFallback('/api/services', mockData.services),
  getProjects: () => getWithFallback('/api/projects', mockData.projects),
  getAbout: () => getWithFallback('/api/about', { values: mockData.values, team: mockData.team }),
  getDashboard: () => getWithFallback('/api/dashboard', null).then(normalizeDashboard),
  submitContact: (payload) => request('/api/contact', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => authRequest('/api/auth/login', payload, localLogin),
  signup: (payload) => authRequest('/api/auth/signup', payload, localSignup),
  sendOtp: (payload) => authRequest('/api/auth/send-otp', payload, () => ({ ok: true, local: true })),
  verifyOtp: (payload) => authRequest('/api/auth/verify-otp', payload, ({ otp }) => {
    if (otp !== '123456') throw new Error('For local development, use OTP 123456.');
    return { ok: true };
  }).then(saveAuthResponse),
  resendOtp: (payload) => authRequest('/api/auth/resend-otp', payload, () => ({ ok: true })),
  getProfile: () => request('/api/profile'),
  updateProfile: (payload) => request('/api/profile', { method: 'PUT', body: JSON.stringify(payload) }),
  getCurrentUser: () => request('/api/users/me'),
  getAccounts: () => request('/api/accounts'),
  createAccount: (payload) => request('/api/accounts', { method: 'POST', body: JSON.stringify(payload) }),
  getTransactions: () => request('/api/transactions'),
  getBeneficiaries: () => request('/api/beneficiaries'),
  addBeneficiary: (payload) => request('/api/beneficiaries', { method: 'POST', body: JSON.stringify(payload) }),
  getTransfers: () => request('/api/transfers'),
  transfer: (payload) => request('/api/transfers', { method: 'POST', body: JSON.stringify(payload) }),
  getBills: () => request('/api/payments/bills'),
  payBill: (payload) => request('/api/payments/bills', { method: 'POST', body: JSON.stringify(payload) }),
  getCards: () => request('/api/cards'),
  freezeCard: (id, value) => request(`/api/cards/${id}/freeze?value=${value}`, { method: 'PATCH' }),
  getLoans: () => request('/api/loans'),
  payLoan: (id, payload) => request(`/api/loans/${id}/pay`, { method: 'POST', body: JSON.stringify(payload) }),
  getStatements: () => request('/api/statements'),
  generateStatement: (accountId, period) => request(`/api/statements/generate?accountId=${accountId}&period=${encodeURIComponent(period)}`, { method: 'POST' }),
  getNotifications: () => request('/api/notifications'),
  markNotificationRead: (id) => request(`/api/notifications/${id}/read`, { method: 'PATCH' }),
  logout: () => window.localStorage.removeItem(AUTH_TOKEN_KEY),
};
