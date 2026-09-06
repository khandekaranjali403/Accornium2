package com.finbank.service;

import com.finbank.dto.*;
import com.finbank.entity.*;
import com.finbank.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class BankingService {
    private final UserLookupService users;
    private final AccountRepository accounts;
    private final TransactionRepository transactions;
    private final BeneficiaryRepository beneficiaries;
    private final TransferRepository transfers;
    private final BillPaymentRepository bills;
    private final BankCardRepository cards;
    private final NotificationRepository notifications;
    private final LoanRepository loans;
    private final StatementRepository statements;

    public BankingService(UserLookupService users, AccountRepository accounts,
                          TransactionRepository transactions, BeneficiaryRepository beneficiaries,
                          TransferRepository transfers, BillPaymentRepository bills,
                          BankCardRepository cards, NotificationRepository notifications,
                          LoanRepository loans, StatementRepository statements) {
        this.users = users; this.accounts = accounts; this.transactions = transactions;
        this.beneficiaries = beneficiaries; this.transfers = transfers; this.bills = bills;
        this.cards = cards; this.notifications = notifications; this.loans = loans;
        this.statements = statements;
    }

    public User user(String email) { return users.byEmail(email); }

    @Transactional
    public Account createAccount(String email, AccountRequest req) {
        User user = user(email);
        Account a = new Account();
        a.setUser(user);
        a.setAccountNumber(String.format("%012d", ThreadLocalRandom.current().nextLong(100000000000L, 999999999999L)));
        a.setType(req.type());
        a.setBalance(req.openingBalance() == null ? BigDecimal.ZERO : req.openingBalance());
        a.setBranch(req.branch() == null ? "Mumbai" : req.branch());
        Account saved = accounts.save(a);
        if (saved.getBalance().signum() > 0) {
            record(saved, "Opening Balance", Transaction.TransactionType.CREDIT, saved.getBalance());
        }
        return saved;
    }

    public List<Account> accounts(String email) { return accounts.findByUser(user(email)); }

    public List<Transaction> transactions(String email) {
        return transactions.findByAccountInOrderByTransactionDateDesc(accounts(email));
    }

    public List<Beneficiary> beneficiaries(String email) { return beneficiaries.findByUser(user(email)); }

    public Beneficiary addBeneficiary(String email, BeneficiaryRequest req) {
        Beneficiary b = new Beneficiary();
        b.setUser(user(email)); b.setName(req.name()); b.setAccountNumber(req.accountNumber());
        b.setBankName(req.bankName()); b.setIfsc(req.ifsc());
        return beneficiaries.save(b);
    }

    @Transactional
    public Transfer transfer(String email, TransferRequest req) {
        User user = user(email);
        Account source = accounts.findByIdAndUser(req.sourceAccountId(), user)
                .orElseThrow(() -> new IllegalArgumentException("Source account not found"));
        Beneficiary beneficiary = beneficiaries.findByIdAndUser(req.beneficiaryId(), user)
                .orElseThrow(() -> new IllegalArgumentException("Beneficiary not found"));

        if (source.getBalance().compareTo(req.amount()) < 0)
            throw new IllegalArgumentException("Insufficient balance");

        source.setBalance(source.getBalance().subtract(req.amount()));
        accounts.save(source);
        record(source, "Transfer to " + beneficiary.getName(), Transaction.TransactionType.DEBIT, req.amount());

        Transfer t = new Transfer();
        t.setUser(user); t.setSourceAccount(source); t.setBeneficiary(beneficiary);
        t.setAmount(req.amount()); t.setRemarks(req.remarks());
        t.setStatus(Transfer.TransferStatus.SUCCESS);
        Transfer saved = transfers.save(t);

        notify(user, "Transfer successful", "₹" + req.amount() + " transferred to " + beneficiary.getName());
        return saved;
    }

    public List<Transfer> transfers(String email) {
        return transfers.findTop50ByUserOrderByCreatedAtDesc(user(email));
    }

    @Transactional
    public BillPayment payBill(String email, BillPaymentRequest req) {
        User user = user(email);
        Account account = accounts.findByIdAndUser(req.accountId(), user)
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));
        if (account.getBalance().compareTo(req.amount()) < 0)
            throw new IllegalArgumentException("Insufficient balance");

        account.setBalance(account.getBalance().subtract(req.amount()));
        accounts.save(account);
        record(account, req.billType() + " - " + req.provider(),
                Transaction.TransactionType.DEBIT, req.amount());

        BillPayment bill = new BillPayment();
        bill.setUser(user); bill.setAccount(account); bill.setBillType(req.billType());
        bill.setProvider(req.provider()); bill.setCustomerReference(req.customerReference());
        bill.setAmount(req.amount()); bill.setStatus(BillPayment.PaymentStatus.SUCCESS);
        BillPayment saved = bills.save(bill);

        notify(user, "Bill payment successful", req.provider() + " payment of ₹" + req.amount());
        return saved;
    }

    public List<BillPayment> bills(String email) {
        return bills.findTop50ByUserOrderByPaidAtDesc(user(email));
    }

    public List<BankCard> cards(String email) { return cards.findByUser(user(email)); }

    public BankCard toggleCard(String email, Long cardId, boolean freeze) {
        User user = user(email);
        BankCard card = cards.findByIdAndUser(cardId, user)
                .orElseThrow(() -> new IllegalArgumentException("Card not found"));
        if (card.getStatus() == BankCard.CardStatus.BLOCKED)
            throw new IllegalArgumentException("Blocked card cannot be changed");
        card.setStatus(freeze ? BankCard.CardStatus.FROZEN : BankCard.CardStatus.ACTIVE);
        return cards.save(card);
    }

    public List<Notification> notifications(String email) { return notifications.findByUserOrderByCreatedAtDesc(user(email)); }

    public Notification markNotificationRead(String email, Long id) {
        Notification n = notifications.findByIdAndUser(id, user(email))
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        n.setReadFlag(true);
        return notifications.save(n);
    }

    public List<Loan> loans(String email) { return loans.findByUserOrderByNextEmiDateAsc(user(email)); }

    @Transactional
    public Loan payLoan(String email, Long loanId, LoanPaymentRequest req) {
        User user = user(email);
        Loan loan = loans.findByIdAndUser(loanId, user)
                .orElseThrow(() -> new IllegalArgumentException("Loan not found"));
        Account account = accounts.findByIdAndUser(req.accountId(), user)
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));

        if (req.amount().compareTo(loan.getOutstandingAmount()) > 0)
            throw new IllegalArgumentException("Payment exceeds outstanding amount");
        if (account.getBalance().compareTo(req.amount()) < 0)
            throw new IllegalArgumentException("Insufficient balance");

        account.setBalance(account.getBalance().subtract(req.amount()));
        BigDecimal remaining = loan.getOutstandingAmount().subtract(req.amount());
        loan.setOutstandingAmount(remaining.signum() == 0 ? BigDecimal.ZERO : remaining);
        if (loan.getOutstandingAmount().signum() == 0) loan.setStatus(Loan.LoanStatus.CLOSED);

        accounts.save(account); loans.save(loan);
        record(account, "Loan EMI - " + loan.getType(), Transaction.TransactionType.DEBIT, req.amount());
        return loan;
    }

    public List<Statement> statements(String email) { return statements.findByUserOrderByGeneratedAtDesc(user(email)); }

    public Statement generateStatement(String email, Long accountId, String period) {
        User user = user(email);
        Account account = accounts.findByIdAndUser(accountId, user)
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));
        Statement s = new Statement();
        s.setUser(user); s.setAccount(account); s.setPeriod(period);
        s.setFileName("statement-" + account.getAccountNumber() + "-" + period.replaceAll("\\s+", "-") + ".pdf");
        return statements.save(s);
    }

    public Map<String, Object> dashboard(String email) {
        User user = user(email);
        List<Account> list = accounts.findByUser(user);
        BigDecimal total = list.stream().map(Account::getBalance).reduce(BigDecimal.ZERO, BigDecimal::add);
        List<Transaction> recent = transactions.findTop50ByAccountInOrderByTransactionDateDesc(list)
                .stream().limit(5).toList();
        long unread = notifications.findByUserOrderByCreatedAtDesc(user).stream().filter(n -> !n.isReadFlag()).count();

        return Map.of("user", Map.of("id", user.getId(), "name", user.getName(), "email", user.getEmail()),
                "totalBalance", total, "accounts", list, "recentTransactions", recent,
                "unreadNotifications", unread);
    }

    private void record(Account account, String description, Transaction.TransactionType type, BigDecimal amount) {
        Transaction tx = new Transaction();
        tx.setAccount(account); tx.setDescription(description); tx.setType(type);
        tx.setAmount(amount); tx.setBalanceAfter(account.getBalance());
        transactions.save(tx);
    }

    private void notify(User user, String title, String message) {
        Notification n = new Notification();
        n.setUser(user); n.setTitle(title); n.setMessage(message);
        notifications.save(n);
    }
}
