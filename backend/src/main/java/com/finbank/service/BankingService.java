package com.finbank.service;

import com.finbank.dto.*;
import com.finbank.entity.*;
import com.finbank.repository.*;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.security.SecureRandom;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class BankingService {
    private static final SecureRandom CARD_RANDOM = new SecureRandom();

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
        String normalizedBranch = normalizeBranch(req.branch());
        a.setBranch(normalizedBranch == null ? "Mumbai" : normalizedBranch);
        Account saved = accounts.save(a);
        if (saved.getBalance().signum() > 0) {
            record(saved, "Opening Balance", Transaction.TransactionType.CREDIT, saved.getBalance());
        }
        return saved;
    }

    public List<Account> accounts(String email) { return accounts.findByUser(user(email)); }

    public Account account(String email, Long accountId) {
        return accounts.findByIdAndUser(accountId, user(email))
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));
    }

    @Transactional
    public void deleteAccount(String email, Long accountId) {
        Account account = account(email, accountId);
        accounts.delete(account);
    }

    @Transactional
    public Account updateAccount(String email, Long accountId, AccountUpdateRequest req) {
        Account account = account(email, accountId);
        account.setType(req.type());
        String normalizedBranch = normalizeBranch(req.branch());
        if (normalizedBranch != null) {
            account.setBranch(normalizedBranch);
        }
        return accounts.save(account);
    }

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

    @Transactional
    public BankCard applyForCreditCard(String email, CardApplicationRequest request) {
        BankCard card = new BankCard();
        card.setUser(user(email));
        card.setHolderName(request.holderName().trim());
        card.setType(BankCard.CardType.CREDIT);
        card.setStatus(BankCard.CardStatus.ACTIVE);
        card.setCardNumberMasked(String.format("•••• •••• •••• %04d", CARD_RANDOM.nextInt(10_000)));
        card.setExpiryDate(LocalDate.now().plusYears(5));
        card.setDailyLimit(50000);
        return cards.save(card);
    }

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
        YearMonth statementPeriod = parseStatementPeriod(period);
        User user = user(email);
        Account account = accounts.findByIdAndUser(accountId, user)
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));
        Statement s = new Statement();
        s.setUser(user); s.setAccount(account); s.setPeriod(period);
        s.setFileName(statementFileName(account, statementPeriod));
        return statements.save(s);
    }

    @Transactional(readOnly = true)
    public StatementFile downloadStatement(String email, Long statementId, String format) {
        Statement statement = statements.findByIdAndUser(statementId, user(email))
                .orElseThrow(() -> new IllegalArgumentException("Statement not found"));
        String normalizedFormat = format == null ? "" : format.trim().toLowerCase(Locale.ROOT);
        if (!normalizedFormat.equals("csv") && !normalizedFormat.equals("pdf")) {
            throw new IllegalArgumentException("Statement format must be csv or pdf");
        }
        YearMonth period = parseStatementPeriod(statement.getPeriod());
        Account account = statement.getAccount();
        LocalDate startDate = period.atDay(1);
        LocalDate endDate = period.plusMonths(1).atDay(1);
        List<Transaction> periodTransactions = transactions
                .findByAccountAndTransactionDateGreaterThanEqualAndTransactionDateLessThanOrderByTransactionDateAsc(
                        account, startDate.atStartOfDay(), endDate.atStartOfDay());

        String fileName = statementFileName(account, period, normalizedFormat);
        if (normalizedFormat.equals("pdf")) {
            return new StatementFile(fileName, "application/pdf", createStatementPdf(account, period, periodTransactions));
        }

        StringBuilder csv = new StringBuilder();
        appendCsvRow(csv, "FinBank account statement");
        appendCsvRow(csv, "Account", account.getAccountNumber());
        appendCsvRow(csv, "Account type", account.getType().name());
        appendCsvRow(csv, "Period", period.toString());
        csv.append("\r\n");
        appendCsvRow(csv, "Date", "Description", "Type", "Amount", "Balance after");
        for (Transaction transaction : periodTransactions) {
            appendCsvRow(csv, transaction.getTransactionDate().toString(), transaction.getDescription(),
                    transaction.getType().name(), transaction.getAmount().toPlainString(),
                    transaction.getBalanceAfter().toPlainString());
        }
        return new StatementFile(fileName, "text/csv;charset=UTF-8", csv.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8));
    }

    private byte[] createStatementPdf(Account account, YearMonth period, List<Transaction> periodTransactions) {
        try (PDDocument document = new PDDocument(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            PDType1Font regular = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
            PDType1Font bold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
            List<String> rows = new ArrayList<>();
            rows.add("DATE         DESCRIPTION                              TYPE       AMOUNT          BALANCE AFTER");
            rows.add("---------------------------------------------------------------------------------------------");
            for (Transaction transaction : periodTransactions) {
                rows.add(String.format(Locale.ROOT, "%-12s %-40s %-10s %12s %16s",
                        transaction.getTransactionDate().toLocalDate(),
                        printable(transaction.getDescription(), 40),
                        transaction.getType().name(),
                        transaction.getAmount().toPlainString(),
                        transaction.getBalanceAfter().toPlainString()));
            }

            int rowsPerPage = 39;
            int pageCount = Math.max(1, (rows.size() + rowsPerPage - 1) / rowsPerPage);
            for (int pageIndex = 0; pageIndex < pageCount; pageIndex++) {
                PDPage page = new PDPage(PDRectangle.LETTER);
                document.addPage(page);
                try (PDPageContentStream content = new PDPageContentStream(document, page)) {
                    content.beginText();
                    content.setFont(bold, 18);
                    content.newLineAtOffset(48, 744);
                    content.showText("FinBank Account Statement");
                    content.endText();

                    content.beginText();
                    content.setFont(regular, 10);
                    content.newLineAtOffset(48, 718);
                    content.showText("Account: " + printable(account.getAccountNumber(), 30));
                    content.newLineAtOffset(0, -15);
                    content.showText("Account type: " + account.getType().name());
                    content.newLineAtOffset(0, -15);
                    content.showText("Statement period: " + period);
                    content.endText();

                    content.beginText();
                    content.setFont(regular, 8);
                    content.newLineAtOffset(48, 660);
                    int rowLimit = Math.min(rows.size(), (pageIndex + 1) * rowsPerPage);
                    for (int rowIndex = pageIndex * rowsPerPage; rowIndex < rowLimit; rowIndex++) {
                        content.showText(rows.get(rowIndex));
                        content.newLineAtOffset(0, -14);
                    }
                    content.endText();

                    content.beginText();
                    content.setFont(regular, 8);
                    content.newLineAtOffset(48, 32);
                    content.showText("Generated by FinBank - Page " + (pageIndex + 1) + " of " + pageCount);
                    content.endText();
                }
            }
            document.save(output);
            return output.toByteArray();
        } catch (IOException exception) {
            throw new IllegalStateException("Could not generate the statement PDF", exception);
        }
    }

    private String printable(String value, int maxLength) {
        String safe = value == null ? "" : value.replaceAll("[^\\x20-\\x7E]", "?");
        return safe.length() <= maxLength ? safe : safe.substring(0, maxLength);
    }

    private YearMonth parseStatementPeriod(String period) {
        try {
            return YearMonth.parse(period);
        } catch (DateTimeParseException | NullPointerException exception) {
            throw new IllegalArgumentException("Statement period must use the YYYY-MM format");
        }
    }

    private String statementFileName(Account account, YearMonth period) {
        return statementFileName(account, period, "csv");
    }

    private String statementFileName(Account account, YearMonth period, String format) {
        String lastFour = account.getAccountNumber().substring(Math.max(0, account.getAccountNumber().length() - 4));
        return "statement-" + lastFour + "-" + period + "." + format;
    }

    private void appendCsvRow(StringBuilder csv, String... values) {
        for (int index = 0; index < values.length; index++) {
            if (index > 0) csv.append(',');
            String value = values[index] == null ? "" : values[index];
            if (value.matches("^\\s*[=+@-].*")) value = "'" + value;
            csv.append('"').append(value.replace("\"", "\"\"")).append('"');
        }
        csv.append("\r\n");
    }

    public record StatementFile(String fileName, String contentType, byte[] content) { }

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

    private String normalizeBranch(String branch) {
        if (branch == null) return null;
        String trimmed = branch.trim();
        return trimmed.isEmpty() ? null : trimmed;
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
