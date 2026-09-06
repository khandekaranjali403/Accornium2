import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

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

function BankingLayout({ title, subtitle, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState({ name: 'Anjali Sharma', initials: 'AS' });

  useEffect(() => {
    api.getCurrentUser().then((user) => {
      if (user) setProfile({ ...user, initials: user.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() });
    }).catch(() => {});
  }, []);

  return (
    <div className="banking-app">
      <aside className={`banking-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
        <div className="banking-logo"><span>+</span> FinBank</div>
        <small>Banking for a better tomorrow</small>
        <nav className="banking-nav">
          {navigation.map((item) => (
            <NavLink key={item.to} to={item.to} onClick={() => setSidebarOpen(false)}>
              <span>{item.icon}</span>{item.label}
            </NavLink>
          ))}
        </nav>
        <nav className="banking-nav banking-nav-bottom">
          <NavLink to="/profile"><span>◉</span>Profile &amp; Settings</NavLink>
          <NavLink to="/logout"><span>↪</span>Logout</NavLink>
        </nav>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <button className="dashboard-menu" type="button" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle menu">☰</button>
          <div className="dashboard-search">⌕ <span>Search something...</span></div>
          <div className="dashboard-actions"><span>♧</span><span>♧</span><div className="profile-chip"><strong>{profile.initials}</strong><span><b>{profile.name}</b><small>Premium Customer</small></span></div></div>
        </header>
        <section className="dashboard-content banking-page-content">
          <div className="dashboard-welcome"><h1>{title}</h1><p>{subtitle}</p></div>
          {children}
        </section>
      </main>
    </div>
  );
}

const accountCards = [
  { title: 'Savings Account', number: '•••• 4587', balance: '₹ 2,45,120', tone: 'green', note: 'Available balance' },
  { title: 'Current Account', number: '•••• 2214', balance: '₹ 3,37,220', tone: 'blue', note: 'Available balance' },
  { title: 'Fixed Deposit', number: 'FD •••• 1090', balance: '₹ 1,00,000', tone: 'purple', note: 'Matures in 8 months' },
];

export function Accounts() {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => { api.getAccounts().then(setAccounts).catch(() => {}); }, []);

  return (
    <BankingLayout title="My Accounts" subtitle="Manage your accounts and balances">
      <div className="banking-card-grid">{(accounts.length ? accounts : accountCards).map((account, index) => { const title = account.title || `${String(account.type || 'Bank').replace('_', ' ')} Account`; const balance = account.balance !== undefined ? `₹ ${Number(account.balance).toLocaleString('en-IN')}` : account.balance; return <article className="account-card" key={account.id || title}><div className={`account-card-icon ${account.tone || ['green', 'blue', 'purple'][index % 3]}`}>₹</div><div><span>{title}</span><small>{account.accountNumber ? `•••• ${account.accountNumber.slice(-4)}` : account.number}</small></div><strong>{balance}</strong><em>{account.note || 'Available balance'}</em><button type="button">View Details</button></article>; })}</div>
      <section className="banking-panel account-details"><div className="panel-heading"><h2>Account Details</h2><button type="button">Edit Details</button></div><div className="detail-grid"><span>Account Holder<b>{accounts[0]?.user?.name || 'Anjali Sharma'}</b></span><span>Account Number<b>{accounts[0]?.accountNumber || 'Select an account'}</b></span><span>Account Type<b>{accounts[0]?.type || 'Savings Account'}</b></span><span>Branch<b>{accounts[0]?.branch || 'Mumbai'}</b></span><span>Available Balance<b className="positive">{accounts[0] ? `₹ ${Number(accounts[0].balance).toLocaleString('en-IN')}` : '₹ 0'}</b></span></div></section>
    </BankingLayout>
  );
}

const transactions = [
  ['Amazon', '20 Sep 2024', 'Debit', '-₹ 2,490', 'debit'],
  ['Salary Credit', '19 Sep 2024', 'Credit', '+₹ 1,20,000', 'credit'],
  ['Electricity Bill', '18 Sep 2024', 'Debit', '-₹ 1,250', 'debit'],
  ['Swiggy', '17 Sep 2024', 'Debit', '-₹ 450', 'debit'],
  ['Transfer to Rohan', '16 Sep 2024', 'Debit', '-₹ 10,000', 'debit'],
  ['Zomato', '15 Sep 2024', 'Debit', '-₹ 580', 'debit'],
];

export function Transactions() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.getTransactions().then(setItems).catch(() => {}); }, []);
  const rows = items.length ? items.map((item) => [item.description, item.transactionDate || 'Recent', item.type, `${item.type === 'CREDIT' ? '+' : '-'}₹ ${Number(item.amount).toLocaleString('en-IN')}`, item.type === 'CREDIT' ? 'credit' : 'debit']) : transactions;
  return <BankingLayout title="Transactions" subtitle="View your transaction history"><div className="filter-row"><select defaultValue="all"><option value="all">All Accounts</option></select><select defaultValue="month"><option value="month">Last 3 Months</option></select><select defaultValue="types"><option value="types">All Types</option></select></div><section className="banking-panel transaction-table"><div className="transaction-table-head"><span>Date</span><span>Description</span><span>Type</span><span>Amount</span><span>Balance</span></div>{rows.map((item, index) => <div className="transaction-table-row" key={`${item[0]}-${item[1]}-${index}`}><span>{item[1]}</span><strong>{item[0]}</strong><span className={item[4]}>{item[2]}</span><b className={item[4]}>{item[3]}</b><span>Live</span></div>)}</section></BankingLayout>;
}

export function Transfer() {
  const [submitted, setSubmitted] = useState(false);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({ sourceAccountId: '', beneficiaryId: '', amount: '', remarks: '' });
  useEffect(() => { Promise.all([api.getBeneficiaries(), api.getAccounts()]).then(([items, accountItems]) => { setBeneficiaries(items); setAccounts(accountItems); setForm((current) => ({ ...current, beneficiaryId: items[0]?.id || '', sourceAccountId: accountItems[0]?.id || '' })); }).catch(() => {}); }, []);
  const submitTransfer = async () => {
    try { await api.transfer({ sourceAccountId: Number(form.sourceAccountId), beneficiaryId: Number(form.beneficiaryId), amount: Number(form.amount), remarks: form.remarks }); setSubmitted(true); } catch (error) { setSubmitted(error.message); }
  };
  return <BankingLayout title="Transfer Money" subtitle="Send money securely and instantly"><div className="transfer-layout"><section className="banking-panel transfer-form"><div className="transfer-tabs"><button className="active" type="button">To Account</button><button type="button">UPI</button><button type="button">To Mobile</button><button type="button">To Self</button></div><label>From Account<select value={form.sourceAccountId} onChange={(event) => setForm({ ...form, sourceAccountId: event.target.value })}>{accounts.map((item) => <option key={item.id} value={item.id}>{item.type} •••• {item.accountNumber?.slice(-4)}</option>)}</select></label><label>Select Beneficiary<select value={form.beneficiaryId} onChange={(event) => setForm({ ...form, beneficiaryId: event.target.value })}>{beneficiaries.map((item) => <option key={item.id} value={item.id}>{item.name} •••• {item.accountNumber?.slice(-4)}</option>)}</select></label><button className="add-beneficiary" type="button">+ Add New Beneficiary</button><label>Amount<input placeholder="Enter amount" inputMode="numeric" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} /></label><label>Remarks (Optional)<input placeholder="Add a note" value={form.remarks} onChange={(event) => setForm({ ...form, remarks: event.target.value })} /></label><button className="primary-action" type="button" onClick={submitTransfer}>{submitted === true ? 'Transfer Complete' : typeof submitted === 'string' ? submitted : 'Continue'}</button></section><section className="banking-panel beneficiary-panel"><h2>Recent Beneficiaries</h2>{beneficiaries.map((item) => <div className="beneficiary-row" key={item.id}><span>{item.name[0]}</span><strong>{item.name}<small>{item.bankName} •••• {item.accountNumber?.slice(-4)}</small></strong></div>)}</section></div></BankingLayout>;
}

export function Payments() {
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({ accountId: '', provider: 'Airtel', customerReference: '', amount: '' });
  const [status, setStatus] = useState('');
  useEffect(() => { api.getAccounts().then((items) => { setAccounts(items); setForm((current) => ({ ...current, accountId: items[0]?.id || '' })); }).catch(() => {}); }, []);
  const submitPayment = async () => { try { await api.payBill({ accountId: Number(form.accountId), billType: 'MOBILE', provider: form.provider, customerReference: form.customerReference, amount: Number(form.amount) }); setStatus('Payment successful'); } catch (error) { setStatus(error.message); } };
  return <BankingLayout title="Payments & Bills" subtitle="Pay bills and recharge instantly"><div className="page-tabs"><button className="active" type="button">Mobile</button><button type="button">Electricity</button><button type="button">DTH</button><button type="button">Broadband</button><button type="button">Water</button><button type="button">Gas</button></div><div className="payments-layout"><section className="banking-panel payment-form"><h2>Mobile Recharge</h2><label>Account<select value={form.accountId} onChange={(event) => setForm({ ...form, accountId: event.target.value })}>{accounts.map((item) => <option key={item.id} value={item.id}>{item.type} •••• {item.accountNumber?.slice(-4)}</option>)}</select></label><label>Enter Mobile Number<input placeholder="+91 98765 43210" value={form.customerReference} onChange={(event) => setForm({ ...form, customerReference: event.target.value })} /></label><label>Select Operator<select value={form.provider} onChange={(event) => setForm({ ...form, provider: event.target.value })}><option>Airtel</option><option>Jio</option><option>Vi</option></select></label><label>Amount<input placeholder="Enter amount" inputMode="decimal" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} /></label><button className="primary-action" type="button" onClick={submitPayment}>Proceed to Pay</button>{status && <p className="form-success">{status}</p>}</section><section className="banking-panel bill-promo"><h2>Stay Connected Always</h2><p>Enjoy high-speed connectivity with easy, secure recharges.</p><div className="phone-illustration">◉<strong>VI</strong></div></section></div></BankingLayout>;
}

export function Cards() {
  const [cards, setCards] = useState([]);
  const [status, setStatus] = useState('');
  useEffect(() => { api.getCards().then(setCards).catch(() => {}); }, []);
  const card = cards[0];
  const toggleCard = async () => { if (!card) return; try { const updated = await api.freezeCard(card.id, card.status !== 'FROZEN'); setCards([updated, ...cards.slice(1)]); } catch (error) { setStatus(error.message); } };
  return <BankingLayout title="My Cards" subtitle="Manage your debit and credit cards"><div className="cards-heading"><div className="page-tabs"><button className="active" type="button">Debit Cards</button><button type="button">Credit Cards</button></div></div><div className="cards-layout"><article className="virtual-card"><div><b>FinBank</b><span>{card?.cardNetwork || 'VISA'}</span></div><strong>•••• •••• •••• {card?.lastFour || '1234'}</strong><div><small>{card?.cardHolderName || 'ANJALI SHARMA'}</small><small>{card?.expiryDate || '09/28'}</small></div></article><section className="banking-panel card-details"><h2>Card Details <span className="status-pill">{card?.status || 'Loading'}</span></h2><p>FinBank Visa Platinum Debit Card</p><div className="detail-grid"><span>Card Type<b>{card?.type || 'Debit Card'}</b></span><span>Daily Limit<b>{card?.dailyLimit ? `₹ ${Number(card.dailyLimit).toLocaleString('en-IN')}` : 'Managed by bank'}</b></span><span>Expiry Date<b>{card?.expiryDate || '09/28'}</b></span></div><div className="card-actions"><button type="button" onClick={toggleCard}>{card?.status === 'FROZEN' ? 'Unfreeze Card' : 'Freeze Card'}</button></div>{status && <p className="form-error">{status}</p>}</section></div></BankingLayout>;
}

export function Loans() {
  const [loans, setLoans] = useState([]);
  const [status, setStatus] = useState('');
  useEffect(() => { api.getLoans().then(setLoans).catch(() => {}); }, []);
  const loan = loans[0];
  const payLoan = async () => { if (!loan) return; try { await api.payLoan(loan.id, { accountId: loan.account?.id, amount: loan.nextEmiAmount || loan.outstandingAmount }); setStatus('Loan payment successful'); } catch (error) { setStatus(error.message); } };
  return <BankingLayout title="Loans" subtitle="Your loans and credit facilities"><div className="loan-layout"><section className="banking-panel loan-summary"><h2>{loan?.type || 'Personal Loan'}</h2><div className="loan-status"><span>Outstanding <b>{loan ? `₹ ${Number(loan.outstandingAmount).toLocaleString('en-IN')}` : 'Loading'}</b></span><span>Loan Amount <b>{loan ? `₹ ${Number(loan.principalAmount).toLocaleString('en-IN')}` : 'Loading'}</b></span></div><div className="progress-track"><i /></div><p>Next EMI <strong>{loan?.nextEmiAmount ? `₹ ${Number(loan.nextEmiAmount).toLocaleString('en-IN')}` : 'See loan details'}</strong><span>{loan?.nextEmiDate || 'Upcoming'}</span></p><button className="primary-action" type="button" onClick={payLoan}>Make Payment</button>{status && <p className="form-success">{status}</p>}</section><section className="banking-panel explore-loans"><h2>Explore More Loans</h2>{['Home Loan', 'Car Loan', 'Education Loan'].map((loanType) => <div className="loan-option" key={loanType}><span>⌂</span><strong>{loanType}<small>Competitive interest rates</small></strong></div>)}</section></div></BankingLayout>;
}

export function Statements() {
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({ accountId: '', period: 'Last 3 Months' });
  const [status, setStatus] = useState('');
  useEffect(() => { api.getAccounts().then((items) => { setAccounts(items); setForm((current) => ({ ...current, accountId: items[0]?.id || '' })); }).catch(() => {}); }, []);
  const generate = async () => { try { const result = await api.generateStatement(form.accountId, form.period); setStatus(result?.fileName ? `Generated ${result.fileName}` : 'Statement generated'); } catch (error) { setStatus(error.message); } };
  return <BankingLayout title="Account Statements" subtitle="Download your account statements"><section className="statements-layout"><section className="banking-panel statement-form"><label>Select Account<select value={form.accountId} onChange={(event) => setForm({ ...form, accountId: event.target.value })}>{accounts.map((item) => <option key={item.id} value={item.id}>{item.type} •••• {item.accountNumber?.slice(-4)}</option>)}</select></label><label>Select Period<select value={form.period} onChange={(event) => setForm({ ...form, period: event.target.value })}><option>Last 3 Months</option><option>Last Financial Year</option></select></label><button className="primary-action" type="button" onClick={generate}>Generate Statement</button>{status && <p className="form-success">{status}</p>}</section><section className="banking-panel statement-empty"><div>▤</div><h2>View and download your statements</h2><p>Select an account and period to generate your statement.</p></section></section></BankingLayout>;
}

export function SessionExpired() {
  const navigate = useNavigate();
  return <div className="session-page"><section className="session-card"><div className="session-mark">▣</div><h1>You've been logged out</h1><p>Thank you for banking with us.<br />Stay secure and come back soon!</p><button className="primary-action" type="button" onClick={() => { api.logout(); navigate('/login'); }}>Login Again</button><div className="session-shield">✦<span>✓</span></div></section></div>;
}

export function Profile() {
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState('');
  useEffect(() => { api.getProfile().then(setProfile).catch((error) => setStatus(error.message)); }, []);
  const save = async () => { try { const updated = await api.updateProfile({ name: profile.name }); setProfile({ ...profile, ...updated }); setStatus('Profile updated'); } catch (error) { setStatus(error.message); } };
  return <BankingLayout title="Profile & Settings" subtitle="Manage your account preferences"><section className="banking-panel profile-panel"><div className="profile-large">{profile?.name?.slice(0, 2).toUpperCase() || 'AS'}</div><input value={profile?.name || ''} onChange={(event) => setProfile({ ...profile, name: event.target.value })} placeholder="Your name" /><p>{profile?.email || 'Loading profile...'}</p><button className="primary-action compact" type="button" onClick={save}>Save Profile</button>{status && <p className="form-success">{status}</p>}</section></BankingLayout>;
}
