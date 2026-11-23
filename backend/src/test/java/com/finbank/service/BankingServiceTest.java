package com.finbank.service;

import com.finbank.dto.AccountRequest;
import com.finbank.dto.LoanApplicationRequest;
import com.finbank.dto.LoanPaymentRequest;
import com.finbank.dto.TransferRequest;
import com.finbank.entity.*;
import com.finbank.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BankingServiceTest {
    @Mock UserLookupService users;
    @Mock AccountRepository accounts;
    @Mock TransactionRepository transactions;
    @Mock BeneficiaryRepository beneficiaries;
    @Mock TransferRepository transfers;
    @Mock BillPaymentRepository bills;
    @Mock BankCardRepository cards;
    @Mock NotificationRepository notifications;
    @Mock LoanRepository loans;
    @Mock StatementRepository statements;
    @InjectMocks BankingService bankingService;

    @Test
    void createAccountAppliesDefaultsWithoutCreatingOpeningTransactionForZeroBalance() {
        User user = user("user@example.com");
        when(users.byEmail("user@example.com")).thenReturn(user);
        when(accounts.save(any(Account.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Account account = bankingService.createAccount("user@example.com",
                new AccountRequest(Account.AccountType.SAVINGS, null, null));

        assertSame(user, account.getUser());
        assertEquals(Account.AccountType.SAVINGS, account.getType());
        assertEquals(BigDecimal.ZERO, account.getBalance());
        assertEquals("Mumbai", account.getBranch());
        assertEquals(12, account.getAccountNumber().length());
        verify(transactions, never()).save(any());
    }

    @Test
    void transferRejectsInsufficientBalanceBeforeSavingChanges() {
        User user = user("user@example.com");
        Account source = account(user, new BigDecimal("10.00"));
        Beneficiary beneficiary = new Beneficiary();
        beneficiary.setName("Recipient");
        when(users.byEmail("user@example.com")).thenReturn(user);
        when(accounts.findByIdAndUser(1L, user)).thenReturn(Optional.of(source));
        when(beneficiaries.findByIdAndUser(2L, user)).thenReturn(Optional.of(beneficiary));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> bankingService.transfer("user@example.com",
                        new TransferRequest(1L, 2L, new BigDecimal("10.01"), "rent")));

        assertEquals("Insufficient balance", exception.getMessage());
        verify(accounts, never()).save(any());
        verify(transfers, never()).save(any());
    }

    @Test
    void transferDebitsSourceCreatesTransferAndNotification() {
        User user = user("user@example.com");
        Account source = account(user, new BigDecimal("100.00"));
        Beneficiary beneficiary = new Beneficiary();
        beneficiary.setName("Recipient");
        when(users.byEmail("user@example.com")).thenReturn(user);
        when(accounts.findByIdAndUser(1L, user)).thenReturn(Optional.of(source));
        when(beneficiaries.findByIdAndUser(2L, user)).thenReturn(Optional.of(beneficiary));
        when(transfers.save(any(Transfer.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Transfer transfer = bankingService.transfer("user@example.com",
                new TransferRequest(1L, 2L, new BigDecimal("25.00"), "rent"));

        assertEquals(new BigDecimal("75.00"), source.getBalance());
        assertEquals(new BigDecimal("25.00"), transfer.getAmount());
        assertEquals(Transfer.TransferStatus.SUCCESS, transfer.getStatus());
        verify(accounts).save(source);
        verify(transactions).save(any(Transaction.class));
        verify(notifications).save(any(Notification.class));
    }

    @Test
    void payLoanClosesLoanWhenFinalPaymentIsMade() {
        User user = user("user@example.com");
        Loan loan = new Loan();
        loan.setType(Loan.LoanType.PERSONAL);
        loan.setOutstandingAmount(new BigDecimal("50.00"));
        Account account = account(user, new BigDecimal("100.00"));
        when(users.byEmail("user@example.com")).thenReturn(user);
        when(loans.findByIdAndUser(3L, user)).thenReturn(Optional.of(loan));
        when(accounts.findByIdAndUser(1L, user)).thenReturn(Optional.of(account));

        Loan result = bankingService.payLoan("user@example.com", 3L,
                new LoanPaymentRequest(1L, new BigDecimal("50.00")));

        assertSame(loan, result);
        assertEquals(BigDecimal.ZERO, loan.getOutstandingAmount());
        assertEquals(Loan.LoanStatus.CLOSED, loan.getStatus());
        assertEquals(new BigDecimal("50.00"), account.getBalance());
        verify(loans).save(loan);
        verify(accounts).save(account);
        verify(transactions).save(any(Transaction.class));
    }

    @Test
    void applyForLoanCreatesActiveLoanWithMonthlyEmiDate() {
        User user = user("user@example.com");
        when(users.byEmail("user@example.com")).thenReturn(user);
        when(loans.save(any(Loan.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Loan loan = bankingService.applyForLoan("user@example.com",
                new LoanApplicationRequest(Loan.LoanType.HOME,
                        new BigDecimal("100000.00"), new BigDecimal("5000.00")));

        assertSame(user, loan.getUser());
        assertEquals(Loan.LoanType.HOME, loan.getType());
        assertEquals(new BigDecimal("100000.00"), loan.getLoanAmount());
        assertEquals(new BigDecimal("100000.00"), loan.getOutstandingAmount());
        assertEquals(new BigDecimal("5000.00"), loan.getEmiAmount());
        assertEquals(LocalDate.now().plusMonths(1), loan.getNextEmiDate());
        assertEquals(Loan.LoanStatus.ACTIVE, loan.getStatus());
        verify(loans).save(loan);
    }

    @Test
    void applyForLoanRejectsEmiLargerThanPrincipal() {
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> bankingService.applyForLoan("user@example.com",
                        new LoanApplicationRequest(Loan.LoanType.PERSONAL,
                                new BigDecimal("1000.00"), new BigDecimal("1000.01"))));

        assertEquals("EMI amount cannot exceed the loan amount", exception.getMessage());
        verify(loans, never()).save(any());
    }

    private User user(String email) {
        User user = new User();
        user.setEmail(email);
        user.setName("User");
        return user;
    }

    private Account account(User user, BigDecimal balance) {
        Account account = new Account();
        account.setUser(user);
        account.setBalance(balance);
        account.setAccountNumber("123456789012");
        return account;
    }
}