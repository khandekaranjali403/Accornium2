import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { calculateMonthlyEmi } from '../services/loanCalculations';

const API_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
const tabs = [
  { id: 'overview', label: 'Dashboard', icon: '▦', endpoint: '/api/dashboard' },
  { id: 'accounts', label: 'Accounts', icon: '▣', endpoint: '/api/accounts' },
  { id: 'transactions', label: 'Transactions', icon: '↔', endpoint: '/api/transactions' },
  { id: 'transfers', label: 'Transfer Money', icon: '➜', endpoint: '/api/transfers' },
  { id: 'payments', label: 'Payments & Bills', icon: '▤', endpoint: '/api/payments/bills' },
  { id: 'cards', label: 'Cards', icon: '▱', endpoint: '/api/cards' },
  { id: 'loans', label: 'Loans', icon: '▥', endpoint: '/api/loans' },
  { id: 'statements', label: 'Statements', icon: '▤', endpoint: '/api/statements' },
  { id: 'profile', label: 'Profile & Settings', icon: '◉', endpoint: '/api/profile' },
  { id: 'beneficiaries', label: 'Beneficiaries', icon: '♧', endpoint: '/api/beneficiaries' },
  { id: 'notifications', label: 'Notifications', icon: '♧', endpoint: '/api/notifications' },
];
const loanProducts = {
  HOME: { label: 'Home', annualRate: 8.5, minTermMonths: 12, maxTermMonths: 360, defaultTermMonths: 120 },
  CAR: { label: 'Car', annualRate: 9.5, minTermMonths: 12, maxTermMonths: 84, defaultTermMonths: 60 },
};

async function apiRequest(path, options = {}) {
  const token = window.sessionStorage.getItem('finbank-token');
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  const responseText = await response.text();
  let data = null;
  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch (error) {
      data = { message: responseText };
    }
  }
  if (!response.ok) {
    const error = new Error(data?.message || data?.error || `Request failed (${response.status}).`);
    error.status = response.status;
    throw error;
  }
  return data;
}

function recordsFrom(data) {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') return [data];
  return [];
}

function displayValue(value) {
  if (value == null) return '—';
  if (typeof value !== 'object') return String(value);
  return Object.entries(value)
    .filter(([, nested]) => nested == null || typeof nested !== 'object')
    .map(([key, nested]) => `${key}: ${nested ?? '—'}`)
    .join(' · ') || 'Details';
}

function money(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

function DashboardCharts({ accounts = [], transactions = [] }) {
  const totalBalance = accounts.reduce((sum, account) => sum + Number(account.balance || 0), 0);
  const allocation = accounts.map((account, index) => ({
    ...account,
    share: totalBalance > 0 ? Number(account.balance || 0) / totalBalance : 0,
    color: ['#3478d4', '#16a879', '#f0a638', '#8c6ade', '#ed6b62'][index % 5],
  }));
  const circumference = 2 * Math.PI * 52;
  const recentTransactions = [...transactions]
    .sort((a, b) => String(a.transactionDate || '').localeCompare(String(b.transactionDate || '')))
    .slice(-6);
  const maxTransaction = Math.max(...recentTransactions.map((transaction) => Number(transaction.amount || 0)), 1);
  const creditTotal = recentTransactions
    .filter((transaction) => transaction.type === 'CREDIT')
    .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
  const debitTotal = recentTransactions
    .filter((transaction) => transaction.type === 'DEBIT')
    .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

  return (
    <div className="finbank-charts">
      <article className="finbank-chart-card">
        <div className="finbank-chart-heading">
          <div><h2>Balance allocation</h2><p>How your balance is spread across accounts</p></div>
        </div>
        {accounts.length ? (
          <div className="finbank-allocation">
            <div className="finbank-donut-wrap">
              <svg className="finbank-donut-chart" viewBox="0 0 140 140" role="img" aria-label="Donut chart showing the share of total balance in each account">
                <circle className="finbank-donut-track" cx="70" cy="70" r="52" />
                {totalBalance > 0 && allocation.map((account, index) => {
                  const precedingShare = allocation.slice(0, index).reduce((sum, item) => sum + item.share, 0);
                  const segment = circumference * account.share;
                  return (
                    <circle
                      key={account.id || account.accountNumber}
                      cx="70"
                      cy="70"
                      r="52"
                      fill="none"
                      stroke={account.color}
                      strokeWidth="15"
                      strokeDasharray={`${segment} ${circumference - segment}`}
                      strokeDashoffset={-circumference * precedingShare}
                      transform="rotate(-90 70 70)"
                    />
                  );
                })}
              </svg>
              <div className="finbank-donut-center"><strong>{accounts.length}</strong><span>accounts</span></div>
            </div>
            <div className="finbank-allocation-legend">
              {allocation.map((account) => (
                <div className="finbank-allocation-item" key={account.id || account.accountNumber}>
                  <span className="finbank-allocation-swatch" style={{ backgroundColor: account.color }} />
                  <span className="finbank-allocation-name">{account.type || 'Account'} ···· {String(account.accountNumber || '').slice(-4)}</span>
                  <strong>{Math.round(account.share * 100)}%</strong>
                  <span className="finbank-allocation-value">{money(account.balance)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : <p className="finbank-chart-empty">Open an account to see its balance here.</p>}
      </article>

      <article className="finbank-chart-card">
        <div className="finbank-chart-heading">
          <div><h2>Recent activity</h2><p>Credits and debits from your latest transactions</p></div>
        </div>
        {recentTransactions.length ? (
          <>
            <div className="finbank-cashflow-summary">
              <div><span className="finbank-cashflow-dot is-credit" />Money in<strong>{money(creditTotal)}</strong></div>
              <div><span className="finbank-cashflow-dot is-debit" />Money out<strong>{money(debitTotal)}</strong></div>
            </div>
            <div className="finbank-chart-scroll">
              <svg className="finbank-transaction-chart" viewBox="0 0 620 220" role="img" aria-label="Bar chart showing amounts and direction of recent transactions">
                <title>Recent transaction activity</title>
                <line className="finbank-chart-gridline" x1="22" y1="40" x2="598" y2="40" />
                <line className="finbank-chart-gridline" x1="22" y1="95" x2="598" y2="95" />
                <line className="finbank-chart-axis" x1="22" y1="155" x2="598" y2="155" />
              {recentTransactions.map((transaction, index) => {
                const amount = Number(transaction.amount || 0);
                const isCredit = transaction.type === 'CREDIT';
                const height = Math.max((amount / maxTransaction) * 88, 5);
                const x = 55 + index * (510 / Math.max(recentTransactions.length, 1));
                const date = String(transaction.transactionDate || '');
                return (
                  <g key={transaction.id || `${date}-${index}`}>
                    <text className="finbank-chart-value" x={x + 24} y={Math.max(19, 151 - height)} textAnchor="middle">{money(amount)}</text>
                    <rect className={isCredit ? 'finbank-credit-bar' : 'finbank-debit-bar'} x={x} y={155 - height} width="48" height={height} rx="7" />
                    <text className="finbank-chart-label" x={x + 24} y="180" textAnchor="middle">{date.includes('T') ? date.slice(5, 10) : date.slice(0, 10) || '—'}</text>
                  </g>
                );
              })}
              </svg>
            </div>
          </>
        ) : <p className="finbank-chart-empty">Your transaction activity will appear here.</p>}
      </article>
    </div>
  );
}

function OverviewBalanceCard({ totalBalance, accounts, onSelectTab }) {
  return (
    <section className="finbank-overview-hero">
      <div className="finbank-overview-hero-content">
        <span className="finbank-overview-kicker">YOUR FINANCES AT A GLANCE</span>
        <span className="finbank-overview-balance-label">Total available balance</span>
        <strong className="finbank-overview-balance">{money(totalBalance)}</strong>
        <span className="finbank-overview-account-count">{accounts.length} {accounts.length === 1 ? 'account' : 'accounts'} connected</span>
        <div className="finbank-overview-actions">
          <button type="button" onClick={() => onSelectTab('transfers')}>↗ <span>Transfer money</span></button>
          <button type="button" onClick={() => onSelectTab('accounts')}>▣ <span>View accounts</span></button>
        </div>
      </div>
      <svg className="finbank-overview-art" viewBox="0 0 280 210" role="img" aria-label="Decorative illustration of growing account balances">
        <defs>
          <linearGradient id="overview-area-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity=".38" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M12 168 C54 152 58 112 102 126 S160 98 181 110 S225 54 268 27 L268 198 L12 198 Z" fill="url(#overview-area-fill)" />
        <path d="M12 168 C54 152 58 112 102 126 S160 98 181 110 S225 54 268 27" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
        <circle cx="181" cy="110" r="6" fill="#ffffff" />
        <circle cx="268" cy="27" r="6" fill="#ffffff" />
      </svg>
      <span className="finbank-hero-orb finbank-hero-orb-one" />
      <span className="finbank-hero-orb finbank-hero-orb-two" />
    </section>
  );
}

function OverviewMetric({ icon, label, value, tone, detail }) {
  return (
    <article className="finbank-overview-metric">
      <span className={`finbank-metric-icon ${tone}`} aria-hidden="true">{icon}</span>
      <div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>
    </article>
  );
}

function OverviewActivity({ transactions }) {
  if (!transactions.length) return <p className="finbank-chart-empty">Your latest transactions will appear here.</p>;
  return (
    <div className="finbank-overview-activity-list">
      {transactions.slice(0, 5).map((transaction) => (
        <article className="finbank-overview-activity-row" key={transaction.id}>
          <span className={`finbank-activity-icon ${transaction.type === 'CREDIT' ? 'is-credit' : 'is-debit'}`} aria-hidden="true">
            {transaction.type === 'CREDIT' ? '↓' : '↑'}
          </span>
          <div className="finbank-overview-activity-description">
            <strong>{transaction.description || 'Account activity'}</strong>
            <span>{transaction.account?.type || 'Account'} ···· {String(transaction.account?.accountNumber || '').slice(-4)}</span>
          </div>
          <div className="finbank-overview-activity-amount">
            <strong className={transaction.type === 'CREDIT' ? 'is-credit' : 'is-debit'}>{transaction.type === 'CREDIT' ? '+' : '−'}{money(transaction.amount)}</strong>
            <time dateTime={transaction.transactionDate}>{transaction.transactionDate ? new Date(transaction.transactionDate).toLocaleDateString() : '—'}</time>
          </div>
        </article>
      ))}
    </div>
  );
}

function DataTable({ records, tab, onAction }) {
  if (!records.length) return <p className="finbank-empty">Nothing to show yet.</p>;
  const fields = [...new Set(records.flatMap((record) =>
    Object.keys(record || {}).filter((key) => typeof record[key] !== 'object' || record[key] === null)
  ))];
  if (!fields.length) return <p className="finbank-empty">No displayable data was returned.</p>;

  return (
    <div className="finbank-table-wrap">
      <table className="finbank-table">
        <thead><tr>{fields.map((field) => <th key={field}>{field.replace(/([A-Z])/g, ' $1')}</th>)}{['cards', 'notifications'].includes(tab) && <th>Action</th>}</tr></thead>
        <tbody>
          {records.map((record, rowIndex) => (
            <tr key={record.id || record.accountNumber || rowIndex}>
              {fields.map((field) => <td key={field}>{displayValue(record[field])}</td>)}
              {tab === 'cards' && <td><button className="finbank-row-action" type="button" disabled={record.status === 'BLOCKED'} onClick={() => onAction(`/api/cards/${record.id}/freeze?value=${record.status !== 'FROZEN'}`, 'PATCH')}>{record.status === 'FROZEN' ? 'Unfreeze' : 'Freeze'}</button></td>}
              {tab === 'notifications' && <td>{record.readFlag ? 'Read' : <button className="finbank-row-action" type="button" onClick={() => onAction(`/api/notifications/${record.id}/read`, 'PATCH')}>Mark read</button>}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AccountsView({ accounts }) {
  if (!accounts.length) return <p className="finbank-empty">You do not have any accounts yet. Open one below to get started.</p>;

  return (
    <div className="finbank-account-grid">
      {accounts.map((account) => (
        <article className="finbank-account-tile" key={account.id}>
          <div className="finbank-account-tile-top">
            <span className="finbank-account-symbol" aria-hidden="true">F</span>
            <span className="finbank-account-kind">{account.type || 'Account'}</span>
          </div>
          <p>Available balance</p>
          <strong className="finbank-account-balance">{money(account.balance)}</strong>
          <div className="finbank-account-tile-bottom">
            <span>{`•••• •••• ${String(account.accountNumber || '').slice(-4)}`}</span>
            <span>{account.branch || 'FinBank'}</span>
          </div>
        </article>
      ))}
    </div>
  );
}

function TransactionsView({ transactions }) {
  const [type, setType] = useState('ALL');
  const [query, setQuery] = useState('');
  const filtered = transactions.filter((transaction) => {
    const matchesType = type === 'ALL' || transaction.type === type;
    const searchable = `${transaction.description || ''} ${transaction.account?.accountNumber || ''} ${transaction.transactionDate || ''}`.toLowerCase();
    return matchesType && searchable.includes(query.trim().toLowerCase());
  });

  return (
    <section className="finbank-transaction-section">
      <div className="finbank-list-heading">
        <div><h2>Transaction history</h2><p>Review and filter activity across your accounts.</p></div>
        <span>{filtered.length} transactions</span>
      </div>
      <div className="finbank-transaction-filters">
        <label>
          <span className="sr-only">Search transactions</span>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search description or account" />
        </label>
        <label>
          <span className="sr-only">Filter by transaction type</span>
          <select value={type} onChange={(event) => setType(event.target.value)}>
            <option value="ALL">All transactions</option>
            <option value="CREDIT">Money in</option>
            <option value="DEBIT">Money out</option>
          </select>
        </label>
      </div>
      {filtered.length ? (
        <div className="finbank-activity-list">
          {filtered.map((transaction) => (
            <article className="finbank-activity-row" key={transaction.id}>
              <span className={`finbank-activity-icon ${transaction.type === 'CREDIT' ? 'is-credit' : 'is-debit'}`} aria-hidden="true">
                {transaction.type === 'CREDIT' ? '↓' : '↑'}
              </span>
              <div className="finbank-activity-description">
                <strong>{transaction.description || 'Account activity'}</strong>
                <span>{transaction.account?.type || 'Account'} · •••• {String(transaction.account?.accountNumber || '').slice(-4)}</span>
              </div>
              <time dateTime={transaction.transactionDate}>{transaction.transactionDate ? new Date(transaction.transactionDate).toLocaleDateString() : '—'}</time>
              <strong className={`finbank-activity-amount ${transaction.type === 'CREDIT' ? 'is-credit' : 'is-debit'}`}>
                {transaction.type === 'CREDIT' ? '+' : '−'}{money(transaction.amount)}
              </strong>
            </article>
          ))}
        </div>
      ) : <p className="finbank-empty">No transactions match these filters.</p>}
    </section>
  );
}

function CardsView({ cards, onAction, onApply, onSelectTab, busy }) {
  const [type, setType] = useState('DEBIT');
  const [showApplication, setShowApplication] = useState(false);
  const [holderName, setHolderName] = useState(window.sessionStorage.getItem('finbank-user-name') || '');
  const [submitting, setSubmitting] = useState(false);
  const visibleCards = cards.filter((card) => card.type === type);
  const activeCards = cards.filter((card) => card.status === 'ACTIVE').length;
  const frozenCards = cards.filter((card) => card.status === 'FROZEN').length;

  const submitApplication = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    const submitted = await onApply(holderName.trim());
    setSubmitting(false);
    if (submitted) {
      setType('CREDIT');
      setShowApplication(false);
    }
  };

  return (
    <section className="finbank-cards-page">
      <div className="finbank-cards-heading">
        <div><h2>My Cards</h2><p>Manage your debit and credit cards</p></div>
        <button className="finbank-apply-card" type="button" onClick={() => setShowApplication(true)}>
          <span aria-hidden="true">+</span> Apply for a New Card
        </button>
      </div>

      <div className="finbank-card-summary" aria-label="Card summary">
        <div><span className="finbank-card-summary-icon">▱</span><span>Total cards<strong>{cards.length}</strong></span></div>
        <div><span className="finbank-card-summary-icon is-active">✓</span><span>Active<strong>{activeCards}</strong></span></div>
        <div><span className="finbank-card-summary-icon is-frozen">Ⅱ</span><span>Frozen<strong>{frozenCards}</strong></span></div>
      </div>

      <div className="finbank-card-type-tabs" role="tablist" aria-label="Card type">
        {['DEBIT', 'CREDIT'].map((cardType) => (
          <button key={cardType} type="button" role="tab" aria-selected={type === cardType} className={type === cardType ? 'active' : ''} onClick={() => setType(cardType)}>
            {cardType === 'DEBIT' ? 'Debit Cards' : 'Credit Cards'} <span>{cards.filter((card) => card.type === cardType).length}</span>
          </button>
        ))}
      </div>

      {visibleCards.length ? (
        <div className="finbank-cards-layout">
          <div className="finbank-cards-list">
            {visibleCards.map((card) => (
              <article className="finbank-card-management" key={card.id}>
                <HdfcCardVisual card={card} />

                <div className="finbank-card-details">
                  <div className="finbank-card-status-row"><span>Card Status</span><strong className={`finbank-status-pill status-${String(card.status || '').toLowerCase()}`}><i />{card.status || 'ACTIVE'}</strong></div>
                  <div className="finbank-card-status-row">
                    <span>Freeze Card</span>
                    <button className={`finbank-switch${card.status === 'FROZEN' ? ' is-on' : ''}`} type="button" role="switch" aria-checked={card.status === 'FROZEN'} aria-label={`${card.status === 'FROZEN' ? 'Unfreeze' : 'Freeze'} card ending ${String(card.cardNumberMasked || '').slice(-4)}`} disabled={busy || card.status === 'BLOCKED'} onClick={() => onAction(`/api/cards/${card.id}/freeze?value=${card.status !== 'FROZEN'}`, 'PATCH')}>
                      <span />
                    </button>
                  </div>
                  <div className="finbank-card-status-row"><span>Daily Limit</span><strong>{money(card.dailyLimit)}</strong></div>
                  <div className="finbank-card-status-row"><span>Expiry Date</span><strong>{card.expiryDate || '—'}</strong></div>
                </div>

                <div className="finbank-card-quick-actions">
                  <button type="button" disabled title="PIN viewing is not available">▧ <span>View PIN</span></button>
                  <button type="button" disabled title="Card blocking is not available">⊘ <span>Block Card</span></button>
                  <button type="button" disabled title="Limit management is not available">↕ <span>Manage Limits</span></button>
                  <button type="button" onClick={() => onSelectTab('transactions')}>▣ <span>Transaction History</span></button>
                </div>
              </article>
            ))}
          </div>
          <aside className="finbank-card-side-panel">
            <h3>Card Security</h3>
            <p>Keep your card safe. You can temporarily freeze and unfreeze active cards at any time.</p>
            <div className="finbank-card-security-note"><span aria-hidden="true">✓</span><span><strong>Your card details are protected</strong><small>Only masked card numbers are shown.</small></span></div>
          </aside>
        </div>
      ) : (
        <div className="finbank-card-empty">
          <span aria-hidden="true">▱</span>
          <h3>No {type.toLowerCase()} cards yet</h3>
          <p>{type === 'CREDIT' ? 'Apply for a credit card and it will appear here when submitted.' : 'When a debit card is issued for your account, it will appear here.'}</p>
        </div>
      )}

      {showApplication && (
        <div className="finbank-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !submitting) setShowApplication(false); }}>
          <section className="finbank-card-application" role="dialog" aria-modal="true" aria-labelledby="credit-card-application-title">
            <button className="finbank-modal-close" type="button" aria-label="Close application" disabled={submitting} onClick={() => setShowApplication(false)}>×</button>
            <span className="finbank-application-icon" aria-hidden="true">▱</span>
            <h2 id="credit-card-application-title">Apply for a credit card</h2>
            <p>Enter the name to print on your card. Your new card will appear in the Credit Cards tab after submission.</p>
            <form onSubmit={submitApplication}>
              <label htmlFor="credit-card-holder-name">Cardholder name</label>
              <input id="credit-card-holder-name" name="holderName" autoComplete="cc-name" value={holderName} onChange={(event) => setHolderName(event.target.value)} maxLength="100" required />
              <button className="finbank-primary-button" type="submit" disabled={submitting || !holderName.trim()}>{submitting ? 'Submitting…' : 'Submit application'}</button>
            </form>
            <small className="finbank-application-disclaimer">Demo application: card details are generated for this FinBank app and are not usable for real payments.</small>
          </section>
        </div>
      )}
    </section>
  );
}

function HdfcCardVisual({ card }) {
  const cardType = String(card.type || 'DEBIT').toLowerCase();
  return (
    <div className={`finbank-bank-card finbank-finbank-card${cardType === 'credit' ? ' is-credit' : ''}`} role="img" aria-label={`${card.type || 'Debit'} card from FinBank ending ${String(card.cardNumberMasked || '').slice(-4)}, status ${String(card.status || 'active').toLowerCase()}`}>
      <div className="finbank-card-brand">
        <span className="finbank-card-brand-mark" aria-hidden="true">f</span>
        <span><strong>FINBANK</strong><small>Banking that moves with you</small></span>
      </div>
      <span className="hdfc-card-product">{card.type || 'DEBIT'} CARD</span>
      <div className="hdfc-card-chip" aria-hidden="true"><i /><i /><i /><i /></div>
      <strong className="finbank-card-number">{card.cardNumberMasked || '••••  ••••  ••••  ••••'}</strong>
      <div className="hdfc-card-bottom">
        <span>{card.holderName || 'CARDHOLDER'}<small>CARDHOLDER</small></span>
        <span>{card.expiryDate || '—'}<small>VALID THRU</small></span>
        <strong className="hdfc-card-network">VISA</strong>
      </div>
      <span className="hdfc-card-watermark" aria-hidden="true" />
    </div>
  );
}

function LoansView({ loans, accounts, busy, onApply, onPay }) {
  const payableLoans = loans.filter((loan) => loan.status !== 'CLOSED');
  const [application, setApplication] = useState({ type: 'HOME', loanAmount: '', termMonths: String(loanProducts.HOME.defaultTermMonths) });
  const [payment, setPayment] = useState({ loanId: '', accountId: '', amount: '' });
  const product = loanProducts[application.type];
  const principal = Number(application.loanAmount);
  const termMonths = Number(application.termMonths);
  const estimatedEmi = Number.isFinite(principal) && principal > 0 && termMonths >= product.minTermMonths && termMonths <= product.maxTermMonths
    ? calculateMonthlyEmi(principal, product.annualRate, termMonths)
    : null;
  const selectedLoan = payableLoans.find((loan) => String(loan.id) === payment.loanId);

  const submitApplication = async (event) => {
    event.preventDefault();
    if (estimatedEmi == null) return;
    await onApply({
      type: application.type,
      loanAmount: principal,
      emiAmount: estimatedEmi,
    });
  };

  const submitPayment = async (event) => {
    event.preventDefault();
    await onPay({
      loanId: payment.loanId,
      accountId: Number(payment.accountId),
      amount: Number(payment.amount),
    });
  };

  return (
    <div className="finbank-loan-management">
      <form className="finbank-feature-form finbank-loan-form" onSubmit={submitApplication}>
        <h3>Apply for a home or car loan</h3>
        <p className="finbank-loan-copy">Choose a loan type, amount and term to calculate your estimated monthly EMI.</p>
        <div className="finbank-form-fields">
          <label>Loan type
            <select
              value={application.type}
              onChange={(event) => {
                const type = event.target.value;
                setApplication({ ...application, type, termMonths: String(loanProducts[type].defaultTermMonths) });
              }}
            >
              <option value="HOME">Home loan</option>
              <option value="CAR">Car loan</option>
            </select>
          </label>
          <label>Requested amount (₹)
            <input
              type="number"
              min="1"
              step="0.01"
              required
              placeholder="For example, 100000"
              value={application.loanAmount}
              onChange={(event) => setApplication({ ...application, loanAmount: event.target.value })}
            />
          </label>
          <label>Term (months)
            <input
              type="number"
              min={product.minTermMonths}
              max={product.maxTermMonths}
              step="1"
              required
              value={application.termMonths}
              onChange={(event) => setApplication({ ...application, termMonths: event.target.value })}
            />
          </label>
          <label>Indicative annual rate
            <input type="text" readOnly value={`${product.annualRate}% p.a.`} />
          </label>
        </div>
        <div className="finbank-loan-emi-preview">
          <span>Estimated monthly EMI</span>
          <strong>{estimatedEmi == null ? 'Enter a valid amount and term to calculate' : money(estimatedEmi)}</strong>
        </div>
        <p className="finbank-loan-disclaimer">Indicative demo rates only: home 8.5% p.a.; car 9.5% p.a. Final rates may vary by lender and eligibility.</p>
        <button className="finbank-primary-button" type="submit" disabled={busy}>
          {busy ? 'Submitting…' : 'Submit application'}
        </button>
      </form>

      <section className="finbank-loan-list-section">
        <h2>Your loans</h2>
        {loans.length ? (
          <div className="finbank-loan-list">
            {loans.map((loan) => {
              const loanPrincipal = Number(loan.loanAmount || 0);
              const outstanding = Number(loan.outstandingAmount || 0);
              const paidPercent = loanPrincipal > 0 ? Math.min(100, Math.max(0, ((loanPrincipal - outstanding) / loanPrincipal) * 100)) : 0;
              return (
                <article className="finbank-loan-card" key={loan.id}>
                  <div className="finbank-loan-card-heading"><span className="finbank-loan-mark" aria-hidden="true">{loan.type === 'CAR' ? '⌑' : '⌂'}</span><div><h2>{String(loan.type || 'Loan').toLowerCase()} loan</h2><span className={`finbank-card-status status-${String(loan.status || '').toLowerCase()}`}>{loan.status || 'ACTIVE'}</span></div><strong>{money(outstanding)}<small>Outstanding</small></strong></div>
                  <div className="finbank-loan-progress"><span style={{ width: `${paidPercent}%` }} /></div>
                  <div className="finbank-loan-details"><span>Original amount<strong>{money(loanPrincipal)}</strong></span><span>Monthly EMI<strong>{money(loan.emiAmount)}</strong></span><span>Next due<strong>{loan.nextEmiDate || '—'}</strong></span></div>
                </article>
              );
            })}
          </div>
        ) : <p className="finbank-empty">No loans yet. Submit an application above to get started.</p>}
      </section>

      {payableLoans.length > 0 && (
        <form className="finbank-feature-form finbank-loan-form" onSubmit={submitPayment}>
          <h3>Pay a loan</h3>
          <p className="finbank-loan-copy">Choose an active loan and the account to make your payment from.</p>
          <div className="finbank-form-fields">
            <label>Loan
              <select
                required
                value={payment.loanId}
                onChange={(event) => {
                  const loan = payableLoans.find((item) => String(item.id) === event.target.value);
                  const outstanding = Number(loan?.outstandingAmount || 0);
                  const suggestedPayment = Math.min(Number(loan?.emiAmount || outstanding), outstanding);
                  setPayment({ ...payment, loanId: event.target.value, amount: suggestedPayment ? suggestedPayment.toFixed(2) : '' });
                }}
              >
                <option value="">Select a loan</option>
                {payableLoans.map((loan) => <option key={loan.id} value={loan.id}>{loan.type} · {money(loan.outstandingAmount)} outstanding</option>)}
              </select>
            </label>
            <label>Pay from account
              <select required value={payment.accountId} onChange={(event) => setPayment({ ...payment, accountId: event.target.value })}>
                <option value="">Select an account</option>
                {accounts.map((account) => <option key={account.id} value={account.id}>{account.type} · {account.accountNumber}</option>)}
              </select>
            </label>
            <label>Payment amount (₹)
              <input
                type="number"
                min="0.01"
                max={selectedLoan?.outstandingAmount}
                step="0.01"
                required
                value={payment.amount}
                onChange={(event) => setPayment({ ...payment, amount: event.target.value })}
              />
            </label>
          </div>
          {accounts.length === 0 && <p className="finbank-loan-disclaimer">Open a bank account before making a loan payment.</p>}
          <button className="finbank-primary-button" type="submit" disabled={busy || !selectedLoan || accounts.length === 0}>
            {busy ? 'Processing…' : 'Make payment'}
          </button>
        </form>
      )}
    </div>
  );
}

function StatementsView({ statements, onDownload, downloadingStatement }) {
  return (
    <section className="finbank-statements-page">
      <div className="finbank-statements-heading">
        <div><h2>Statement history</h2><p>Download a PDF or CSV copy of any statement you have generated.</p></div>
      </div>
      {statements.length ? (
        <div className="finbank-statement-list">
          {statements.map((statement) => (
            <article className="finbank-statement-row" key={statement.id}>
              <span className="finbank-statement-icon" aria-hidden="true">▤</span>
              <span className="finbank-statement-info"><strong>{statement.fileName || `Statement · ${statement.period}`}</strong><small>{statement.period} · Generated {statement.generatedAt ? new Date(statement.generatedAt).toLocaleDateString() : 'recently'}</small></span>
              <div className="finbank-statement-actions">
                {['pdf', 'csv'].map((format) => {
                  const downloadId = `${statement.id}:${format}`;
                  return (
                    <button
                      className="finbank-row-action finbank-statement-download"
                      type="button"
                      key={format}
                      onClick={() => onDownload(statement, format)}
                      disabled={downloadingStatement !== null}
                    >
                      {downloadingStatement === downloadId ? 'Preparing…' : `↓ ${format.toUpperCase()}`}
                    </button>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="finbank-statements-empty">
          <span className="finbank-statement-icon" aria-hidden="true">▤</span>
          <strong>No statements yet</strong>
          <p>Choose an account and month below to generate your first statement.</p>
        </div>
      )}
    </section>
  );
}

const billCategories = [
  { type: 'MOBILE', label: 'Mobile recharge', icon: '▰' },
  { type: 'ELECTRICITY', label: 'Electricity', icon: 'ϟ' },
  { type: 'BROADBAND', label: 'Broadband', icon: '⌁' },
  { type: 'DTH', label: 'DTH & TV', icon: '▣' },
  { type: 'WATER', label: 'Water', icon: '◌' },
  { type: 'GAS', label: 'Gas', icon: '♨' },
];

function BillCategoryGrid() {
  return (
    <div className="finbank-bill-categories">
      {billCategories.map((category) => <article className="finbank-bill-category" key={category.type}><span aria-hidden="true">{category.icon}</span><strong>{category.label}</strong></article>)}
    </div>
  );
}

function BillHistory({ bills }) {
  if (!bills.length) return <p className="finbank-empty">Your recent bill payments will appear here.</p>;
  return (
    <section className="finbank-bill-history">
      <h2>Recent bill payments</h2>
      {bills.slice(0, 5).map((bill) => (
        <article className="finbank-bill-history-row" key={bill.id}>
          <span className="finbank-statement-icon" aria-hidden="true">✓</span>
          <span><strong>{bill.provider || bill.billType}</strong><small>{bill.billType} · {bill.paidAt ? new Date(bill.paidAt).toLocaleDateString() : 'recently'}</small></span>
          <strong>{money(bill.amount)}</strong>
        </article>
      ))}
    </section>
  );
}

function FeatureForm({ tab, records, onSubmit, busy, onSwitchTab }) {
  const [values, setValues] = useState({});
  const update = (event) => setValues({ ...values, [event.target.name]: event.target.value });
  const input = (name, label, type = 'text', required = true) => (
    <label key={name}>{label}<input name={name} type={type} value={values[name] || ''} onChange={update} required={required} /></label>
  );
  const select = (name, label, choices) => (
    <label key={name}>{label}
      <select name={name} value={values[name] || ''} onChange={update} required>
        <option value="">Select {label.toLowerCase()}</option>
        {choices.map((choice) => <option key={choice.value} value={choice.value}>{choice.label}</option>)}
      </select>
    </label>
  );

  let fields = [];
  let submitLabel = 'Save';
  if (tab === 'accounts') {
    fields = [select('type', 'Account type', [{ value: 'SAVINGS', label: 'Savings' }, { value: 'CURRENT', label: 'Current' }]), input('openingBalance', 'Opening balance', 'number', false), input('branch', 'Branch', 'text', false)];
    submitLabel = 'Open account';
  } else if (tab === 'beneficiaries') {
    fields = [input('name', 'Beneficiary name'), input('accountNumber', 'Account number'), input('bankName', 'Bank name'), input('ifsc', 'IFSC code')];
    submitLabel = 'Add beneficiary';
  } else if (tab === 'transfers') {
    const accounts = records.accounts || [];
    const beneficiaries = records.beneficiaries || [];
    fields = [
      select('sourceAccountId', 'From account', accounts.map((a) => ({ value: a.id, label: `${a.type} · ${a.accountNumber}` }))),
      select('beneficiaryId', 'Beneficiary', beneficiaries.map((b) => ({ value: b.id, label: `${b.name} · ${b.bankName}` }))),
      input('amount', 'Amount', 'number'),
      input('remarks', 'Remarks', 'text', false),
    ];
    submitLabel = 'Send transfer';
  } else if (tab === 'payments') {
    fields = [
      select('accountId', 'Pay from account', (records.accounts || []).map((a) => ({ value: a.id, label: `${a.type} · ${a.accountNumber}` }))),
      select('billType', 'Bill type', ['MOBILE', 'ELECTRICITY', 'DTH', 'BROADBAND', 'WATER', 'GAS'].map((value) => ({ value, label: value }))),
      input('provider', 'Provider'),
      input('customerReference', 'Customer reference'),
      input('amount', 'Amount', 'number'),
    ];
    submitLabel = 'Pay bill';
  } else if (tab === 'statements') {
    fields = [
      select('accountId', 'Account', (records.accounts || []).map((a) => ({ value: a.id, label: `${a.type} · ${a.accountNumber}` }))),
      input('period', 'Statement period', 'month'),
    ];
    submitLabel = 'Generate statement';
  } else if (tab === 'profile') {
    fields = [input('name', 'Full name')];
    submitLabel = 'Update profile';
  }
  if (!fields.length) return null;

  return (
    <div className={tab === 'transfers' ? 'finbank-transfer-grid' : ''}>
      <form className={`finbank-feature-form${tab === 'transfers' ? ' finbank-transfer-form' : ''}`} onSubmit={(event) => { event.preventDefault(); onSubmit(values); }}>
        {tab === 'transfers' && (
          <div className="finbank-transfer-modes" aria-label="Transfer type">
            <button type="button" className="active">To Account</button>
            <button type="button" disabled title="UPI transfers are not available yet">UPI</button>
            <button type="button" disabled title="Mobile transfers are not available yet">To Mobile</button>
            <button type="button" disabled title="Self transfers are not available yet">To Self</button>
          </div>
        )}
        {tab !== 'transfers' && <h3>{submitLabel}</h3>}
        <div className="finbank-form-fields">{fields}</div>
        {tab === 'transfers' && (
          <button className="finbank-add-beneficiary" type="button" onClick={() => onSwitchTab('beneficiaries')}>+ Add New Beneficiary</button>
        )}
        <button className="finbank-primary-button" type="submit" disabled={busy}>{busy ? 'Please wait…' : tab === 'transfers' ? 'Continue' : submitLabel}</button>
      </form>
      {tab === 'transfers' && (
        <aside className="finbank-recent-beneficiaries">
          <h2>Recent Beneficiaries</h2>
          {(records.beneficiaries || []).length ? (records.beneficiaries || []).slice(0, 5).map((beneficiary) => (
            <div className="finbank-beneficiary-item" key={beneficiary.id}>
              <span className="finbank-beneficiary-avatar">{beneficiary.name?.charAt(0)?.toUpperCase() || 'B'}</span>
              <span><strong>{beneficiary.name}</strong><small>{beneficiary.bankName} · •••• {String(beneficiary.accountNumber || '').slice(-4)}</small></span>
            </div>
          )) : <p className="finbank-chart-empty">Your saved beneficiaries will appear here.</p>}
        </aside>
      )}
    </div>
  );
}

function FinBankDashboard({ darkMode, onToggleTheme }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState({});
  const [supportData, setSupportData] = useState({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [downloadingStatementId, setDownloadingStatementId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');

  const loadTab = useCallback(async (tabId = activeTab) => {
    const selected = tabs.find((tab) => tab.id === tabId);
    if (!selected) return;
    setLoading(true);
    setError('');
    try {
      const result = await apiRequest(selected.endpoint);
      setData((current) => ({ ...current, [tabId]: result }));
      if (['transfers', 'payments', 'loans', 'statements'].includes(tabId)) {
        const accounts = await apiRequest('/api/accounts');
        let beneficiaries;
        if (tabId === 'transfers') {
          beneficiaries = await apiRequest('/api/beneficiaries');
        }
        setSupportData((current) => tabId === 'transfers'
          ? { ...current, accounts, beneficiaries }
          : { ...current, accounts });
      }
      if (tabId === 'profile') {
        setData((current) => ({ ...current, profile: result }));
      }
    } catch (requestError) {
      if (requestError.status === 401 || requestError.status === 403) {
        window.sessionStorage.removeItem('finbank-token');
        navigate('/session-expired', { replace: true });
        return;
      }
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [activeTab, navigate]);

  useEffect(() => {
    loadTab(activeTab);
  }, [activeTab, loadTab]);

  const runAction = async (path, method, body, successMessage) => {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await apiRequest(path, { method, ...(body ? { body: JSON.stringify(body) } : {}) });
      setMessage(successMessage || 'Saved successfully.');
      await loadTab(activeTab);
      return true;
    } catch (requestError) {
      setError(requestError.message);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const submitForm = (values) => {
    if (activeTab === 'accounts') {
      return runAction('/api/accounts', 'POST', {
        type: values.type,
        openingBalance: values.openingBalance ? Number(values.openingBalance) : 0,
        branch: values.branch,
      }, 'Account opened.');
    }
    if (activeTab === 'beneficiaries') return runAction('/api/beneficiaries', 'POST', values, 'Beneficiary added.');
    if (activeTab === 'transfers') return runAction('/api/transfers', 'POST', {
      sourceAccountId: Number(values.sourceAccountId),
      beneficiaryId: Number(values.beneficiaryId),
      amount: Number(values.amount),
      remarks: values.remarks,
    }, 'Transfer completed.');
    if (activeTab === 'payments') return runAction('/api/payments/bills', 'POST', {
      ...values,
      accountId: Number(values.accountId),
      amount: Number(values.amount),
    }, 'Bill payment completed.');
    if (activeTab === 'statements') {
      const query = new URLSearchParams({ accountId: values.accountId, period: values.period });
      return runAction(`/api/statements/generate?${query}`, 'POST', null, 'Statement generated.');
    }
    if (activeTab === 'profile') return runAction('/api/profile', 'PUT', { name: values.name }, 'Profile updated.');
  };

  const logout = () => {
    window.sessionStorage.removeItem('finbank-token');
    window.sessionStorage.removeItem('finbank-user-name');
    window.sessionStorage.removeItem('finbank-user-email');
    navigate('/session-expired', { replace: true });
  };

  const downloadStatement = async (statement, format) => {
    setError('');
    setDownloadingStatementId(`${statement.id}:${format}`);
    try {
      const token = window.sessionStorage.getItem('finbank-token');
      const response = await fetch(`${API_URL}/api/statements/${statement.id}/download?format=${encodeURIComponent(format)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          window.sessionStorage.removeItem('finbank-token');
          navigate('/session-expired', { replace: true });
          return;
        }
        const responseText = await response.text();
        let detail = `Request failed (${response.status}).`;
        if (responseText) {
          try {
            const responseData = JSON.parse(responseText);
            detail = responseData.message || responseData.error || detail;
          } catch (parseError) {
            detail = responseText;
          }
        }
        throw new Error(detail);
      }
      const blob = await response.blob();
      if (!blob.size) throw new Error('The statement download returned an empty file.');
      const disposition = response.headers.get('Content-Disposition') || '';
      const encodedFilename = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
      const quotedFilename = disposition.match(/filename="([^"]+)"/i)?.[1];
      const plainFilename = disposition.match(/filename=([^;]+)/i)?.[1]?.trim();
      const responseFilename = encodedFilename
        ? decodeURIComponent(encodedFilename)
        : quotedFilename || plainFilename;
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      const statementBaseName = (statement.fileName || `statement-${statement.period}`).replace(/\.(csv|pdf)$/i, '');
      link.download = responseFilename || `${statementBaseName}.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setDownloadingStatementId(null);
    }
  };

  const active = tabs.find((tab) => tab.id === activeTab);
  const activeData = data[activeTab];
  const records = activeTab === 'overview'
    ? recordsFrom(activeData?.recentTransactions)
    : activeTab === 'profile'
      ? recordsFrom(activeData)
      : recordsFrom(activeData);
  const formRecords = { ...supportData, accounts: supportData.accounts, beneficiaries: supportData.beneficiaries };
  const overviewUser = activeData?.user;
  const overviewCredits = records
    .filter((transaction) => transaction.type === 'CREDIT')
    .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
  const overviewDebits = records
    .filter((transaction) => transaction.type === 'DEBIT')
    .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
  const visibleTabs = tabs.filter((tab) => tab.label.toLowerCase().includes(search.trim().toLowerCase()));

  return (
    <div className="finbank-dashboard">
      <aside className="finbank-sidebar">
        <Link className="finbank-brand" to="/finbank"><span className="finbank-brand-mark" aria-hidden="true">+</span><span>FinBank<small>Banking for a better tomorrow</small></span></Link>
        <nav className="finbank-tabs" role="tablist" aria-label="Banking features" aria-orientation="vertical">
          {visibleTabs.map((tab) => (
            <button key={tab.id} id={`tab-${tab.id}`} type="button" role="tab" aria-selected={activeTab === tab.id} aria-controls="finbank-tab-panel" className={activeTab === tab.id ? 'active' : ''} onClick={() => { setMessage(''); setActiveTab(tab.id); }}>
              <span className="finbank-nav-icon" aria-hidden="true">{tab.icon}</span>{tab.label}
            </button>
          ))}
          {!visibleTabs.length && <p className="finbank-no-nav-results">No matching section</p>}
        </nav>
      </aside>
      <div className="finbank-app-body">
        <header className="finbank-topbar">
          <label className="finbank-search"><span aria-hidden="true">⌕</span><input type="search" placeholder="Search something..." value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search dashboard sections" /></label>
          <div className="finbank-header-user"><span>{(overviewUser?.name || window.sessionStorage.getItem('finbank-user-name') || 'F').charAt(0).toUpperCase()}</span>{overviewUser?.name || window.sessionStorage.getItem('finbank-user-name') || 'Your account'}</div>
          <button className="finbank-theme-toggle" type="button" onClick={onToggleTheme} aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`} aria-pressed={darkMode}>{darkMode ? '☀' : '☾'}</button>
          <button className="finbank-logout" type="button" onClick={logout}>Log out</button>
        </header>
        <main className="finbank-content">
          <section className="finbank-main">
            <h1>{activeTab === 'overview' ? `Welcome${overviewUser?.name ? `, ${overviewUser.name}` : ''}.` : activeTab === 'cards' ? 'Cards Page' : active.label}</h1>
            <p className="finbank-lead">{activeTab === 'transfers' ? 'Send money securely and instantly' : activeTab === 'overview' ? 'Your accounts and recent activity at a glance.' : activeTab === 'cards' ? 'View and manage your FinBank cards' : `Manage your ${active.label.toLowerCase()} securely.`}</p>

            <section id="finbank-tab-panel" className="finbank-tab-panel" role="tabpanel" aria-labelledby={`tab-${activeTab}`} tabIndex="0">
              {error && <p className="finbank-feedback finbank-feedback-error" role="alert">{error}</p>}
              {message && <p className="finbank-feedback finbank-feedback-success" role="status">{message}</p>}
              {loading ? <p className="finbank-empty">Loading {active.label.toLowerCase()}…</p> : (
                <>
                  {activeTab === 'overview' && activeData && (
                    <div className="finbank-overview">
                      <OverviewBalanceCard
                        totalBalance={activeData.totalBalance}
                        accounts={activeData.accounts || []}
                        onSelectTab={setActiveTab}
                      />
                      <div className="finbank-overview-metrics">
                        <OverviewMetric icon="↗" tone="is-credit" label="Money in" value={money(overviewCredits)} detail="Across latest activity" />
                        <OverviewMetric icon="↙" tone="is-debit" label="Money out" value={money(overviewDebits)} detail="Across latest activity" />
                        <OverviewMetric icon="▣" tone="is-blue" label="Accounts" value={String(activeData.accounts?.length || 0)} detail={`${activeData.unreadNotifications || 0} unread notifications`} />
                      </div>
                      <DashboardCharts accounts={activeData.accounts || []} transactions={activeData.recentTransactions || []} />
                      <section className="finbank-overview-activity">
                        <div className="finbank-overview-activity-heading">
                          <div><h2>Recent transactions</h2><p>Your latest account activity</p></div>
                          <button type="button" onClick={() => setActiveTab('transactions')}>View all <span aria-hidden="true">→</span></button>
                        </div>
                        <OverviewActivity transactions={records} />
                      </section>
                    </div>
                  )}
                  {activeTab !== 'overview' && (
                    <>
                      {activeTab === 'profile' && activeData && <p className="finbank-profile-copy">Signed in as {activeData.user?.email || activeData.email}. Account status: {activeData.active ? 'Active' : 'Inactive'}.</p>}
                      {activeTab === 'accounts' && <AccountsView accounts={records} />}
                      {activeTab === 'transactions' && <TransactionsView transactions={records} />}
                      {activeTab === 'cards' && <CardsView cards={records} onAction={(path, method) => runAction(path, method, null, 'Card status updated.')} onApply={(holderName) => runAction('/api/cards', 'POST', { holderName }, 'Credit card application submitted.')} onSelectTab={setActiveTab} busy={busy} />}
                      {activeTab === 'loans' && (
                        <LoansView
                          loans={records}
                          accounts={supportData.accounts || []}
                          busy={busy}
                          onApply={(values) => runAction('/api/loans', 'POST', values, `${loanProducts[values.type].label} loan application submitted.`)}
                          onPay={(values) => runAction(`/api/loans/${values.loanId}/pay`, 'POST', { accountId: values.accountId, amount: values.amount }, 'Loan payment completed.')}
                        />
                      )}
                      {activeTab === 'statements' && <StatementsView statements={records} onDownload={downloadStatement} downloadingStatement={downloadingStatementId} />}
                      {activeTab === 'payments' && <BillCategoryGrid />}
                      {activeTab === 'payments' && <BillHistory bills={records} />}
                      {!['accounts', 'transactions', 'cards', 'loans', 'statements', 'payments', 'transfers'].includes(activeTab) && <DataTable records={records} tab={activeTab} onAction={(path, method) => runAction(path, method, null)} />}
                      {activeTab !== 'loans' && <FeatureForm tab={activeTab} records={formRecords} onSubmit={submitForm} busy={busy} onSwitchTab={setActiveTab} />}
                    </>
                  )}
                </>
              )}
            </section>
          </section>
        </main>
      </div>
    </div>
  );
}

export default FinBankDashboard;
