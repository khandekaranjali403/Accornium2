import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { api } from '../services/api';

const fallbackDashboard = {
  user: { name: 'Anjali Sharma', initials: 'AS' },
  balance: { total: '5,82,340', change: '+2.5% from last month' },
  accounts: [
    { label: 'Savings Account', value: '2,45,120', accent: 'green' },
    { label: 'Current Account', value: '3,37,220', accent: 'blue' },
    { label: 'Rewards Points', value: '2,480', accent: 'purple' },
  ],
  transactions: [
    { name: 'Amazon', date: 'Today, 10:42 AM', amount: '-2,490', type: 'debit', icon: 'A' },
    { name: 'Salary Credit', date: 'Yesterday, 09:15 AM', amount: '+1,20,000', type: 'credit', icon: 'S' },
    { name: 'Electricity Bill', date: '18 Sep 2024', amount: '-1,250', type: 'debit', icon: 'E' },
    { name: 'Swiggy', date: '17 Sep 2024', amount: '-450', type: 'debit', icon: 'S' },
    { name: 'Transfer to Rohan', date: '16 Sep 2024', amount: '-10,000', type: 'debit', icon: 'R' },
  ],
  spending: [
    { label: 'Shopping', value: 40, color: '#2379ef' },
    { label: 'Food', value: 25, color: '#f39c46' },
    { label: 'Bills', value: 20, color: '#54c6a8' },
    { label: 'Others', value: 15, color: '#a077ef' },
  ],
};

const navigation = [
  { to: '/dashboard', label: 'Dashboard', icon: '▦' },
  { to: '/accounts', label: 'Accounts', icon: '▣' },
  { to: '/transactions', label: 'Transactions', icon: '↔' },
  { to: '/transfer', label: 'Transfer Money', icon: '➜' },
  { to: '/payments', label: 'Payments & Bills', icon: '▤' },
  { to: '/cards', label: 'Cards', icon: '▭' },
  { to: '/loans', label: 'Loans', icon: '▥' },
  { to: '/statements', label: 'Statements', icon: '▤' },
];

function Dashboard() {
  const [data, setData] = useState(fallbackDashboard);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    api.getDashboard().then((remoteData) => {
      if (remoteData) setData({ ...fallbackDashboard, ...remoteData });
    });
  }, []);

  return (
    <div className="banking-app">
      <aside className={`banking-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
        <div className="banking-logo"><span>+</span> FinBank</div>
        <small>Banking for a better tomorrow</small>
        <nav className="banking-nav">
          {navigation.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setSidebarOpen(false)}>
              <span>{item.icon}</span>{item.label}
            </NavLink>
          ))}
        </nav>
        <nav className="banking-nav banking-nav-bottom">
          <NavLink to="/profile"><span>◉</span>Profile & Settings</NavLink>
          <NavLink to="/logout"><span>↪</span>Logout</NavLink>
        </nav>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <button className="dashboard-menu" type="button" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle menu">☰</button>
          <div className="dashboard-search">⌕ <span>Search something...</span></div>
          <div className="dashboard-actions"><span>♧</span><span>♧</span><div className="profile-chip"><strong>{data.user.initials}</strong><span><b>{data.user.name}</b><small>Premium Customer</small></span></div></div>
        </header>

        <section className="dashboard-content">
          <div className="dashboard-welcome"><h1>Good Afternoon, {data.user.name.split(' ')[0]}!</h1><p>Here's your financial overview</p></div>
          <div className="dashboard-stats">
            <article className="dashboard-stat"><span>Total Balance</span><strong>₹ {data.balance.total}</strong><small>{data.balance.change}</small></article>
            {data.accounts.map((account) => <article className="dashboard-stat" key={account.label}><span>{account.label}</span><strong>₹ {account.value}</strong><small className={`stat-${account.accent}`}>{account.accent === 'purple' ? 'Redeem your points' : 'Available balance'}</small></article>)}
          </div>

          <div className="dashboard-grid">
            <section className="dashboard-panel transactions-panel"><div className="panel-heading"><h2>Recent Transactions</h2><NavLink to="/transactions">View All</NavLink></div>{data.transactions.map((transaction) => <div className="transaction-row" key={`${transaction.name}-${transaction.date}`}><span className={`transaction-icon ${transaction.type}`}>{transaction.icon}</span><span className="transaction-name"><b>{transaction.name}</b><small>{transaction.date}</small></span><strong className={transaction.type}>{transaction.amount}</strong></div>)}</section>
            <section className="dashboard-panel spending-panel"><div className="panel-heading"><h2>Your Spending</h2><button type="button">This Month⌄</button></div><div className="spending-body"><div className="spending-chart"><div><strong>₹12,340</strong><small>Total spent</small></div></div><div className="spending-legend">{data.spending.map((item) => <span key={item.label}><i style={{ background: item.color }} />{item.label}<b>{item.value}%</b></span>)}</div></div></section>
            <section className="dashboard-promo"><div><span>Invest for a brighter future</span><small>Explore our wealth plans</small><button type="button">Know More</button></div><div className="promo-plant" aria-hidden="true">◒</div></section>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
