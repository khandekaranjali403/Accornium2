package com.finbank.service;

import com.finbank.entity.Account;
import com.finbank.entity.Statement;
import com.finbank.entity.User;
import com.finbank.repository.*;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class BankingServiceStatementTest {

    @Test
    void downloadsPdfStatementWithStandardFontCharacters() {
        UserLookupService users = mock(UserLookupService.class);
        AccountRepository accounts = mock(AccountRepository.class);
        TransactionRepository transactions = mock(TransactionRepository.class);
        StatementRepository statements = mock(StatementRepository.class);
        User user = new User();
        Account account = new Account();
        account.setAccountNumber("123456789012");
        account.setType(Account.AccountType.SAVINGS);
        Statement statement = new Statement();
        statement.setAccount(account);
        statement.setPeriod("2026-11");

        when(users.byEmail("customer@example.com")).thenReturn(user);
        when(statements.findByIdAndUser(1L, user)).thenReturn(Optional.of(statement));
        when(transactions
                .findByAccountAndTransactionDateGreaterThanEqualAndTransactionDateLessThanOrderByTransactionDateAsc(
                        any(Account.class), any(), any()))
                .thenReturn(List.of());

        BankingService service = new BankingService(
                users,
                accounts,
                transactions,
                mock(BeneficiaryRepository.class),
                mock(TransferRepository.class),
                mock(BillPaymentRepository.class),
                mock(BankCardRepository.class),
                mock(NotificationRepository.class),
                mock(LoanRepository.class),
                statements);

        BankingService.StatementFile file =
                service.downloadStatement("customer@example.com", 1L, "pdf");

        assertTrue(file.fileName().endsWith(".pdf"));
        assertTrue(file.contentType().startsWith("application/pdf"));
        assertTrue(file.content().length > 4);
        assertTrue(file.content()[0] == '%' && file.content()[1] == 'P'
                && file.content()[2] == 'D' && file.content()[3] == 'F');
    }
}
