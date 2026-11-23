package com.finbank.config;

import com.finbank.entity.*;
import com.finbank.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;

@Configuration
public class DataInitializer {

    @Value("${app.demo.user.name:Anjali Sharma}")
    private String demoUserName;

    @Value("${app.demo.user.email:anjali@gmail.com}")
    private String demoUserEmail;

    @Value("${app.demo.user.password:Password@123}")
    private String demoUserPassword;

    @Value("${app.demo.account.savings.number:123456789012}")
    private String savingsAccountNumber;

    @Value("${app.demo.account.current.number:987654321098}")
    private String currentAccountNumber;

    @Value("${app.demo.account.branch:Andheri, Mumbai}")
    private String branch;

    @Value("${app.demo.card.masked-number:**** **** **** 1234}")
    private String cardMaskedNumber;

    @Value("${app.demo.card.holder-name:ANJALI SHARMA}")
    private String cardHolderName;

    @Value("${app.demo.beneficiary.name:Rohan Mehta}")
    private String beneficiaryName;

    @Value("${app.demo.beneficiary.account-number:1234567890}")
    private String beneficiaryAccountNumber;

    @Value("${app.demo.beneficiary.bank-name:HDFC BANK}")
    private String beneficiaryBankName;

    @Value("${app.demo.beneficiary.ifsc:HDFC0001234}")
    private String beneficiaryIfsc;

    @Value("${app.demo.loan.amount:500000}")
    private String loanAmount;

    @Value("${app.demo.loan.outstanding:280000}")
    private String loanOutstandingAmount;

    @Value("${app.demo.loan.emi:12500}")
    private String loanEmiAmount;

    @Bean
    CommandLineRunner seed(UserRepository users, AccountRepository accounts,
                           BankCardRepository cards, LoanRepository loans,
                           BeneficiaryRepository beneficiaries,
                           PasswordEncoder encoder) {
        return args -> {
            if (users.existsByEmailIgnoreCase(demoUserEmail)) return;

            User u = new User();
            u.setName(demoUserName);
            u.setEmail(demoUserEmail);
            u.setPassword(encoder.encode(demoUserPassword));
            u.setRole(User.Role.CUSTOMER);
            users.save(u);

            Account savings = new Account();
            savings.setUser(u);
            savings.setAccountNumber(savingsAccountNumber);
            savings.setType(Account.AccountType.SAVINGS);
            savings.setBalance(new BigDecimal("245120.50"));
            savings.setBranch(branch);
            accounts.save(savings);

            Account current = new Account();
            current.setUser(u);
            current.setAccountNumber(currentAccountNumber);
            current.setType(Account.AccountType.CURRENT);
            current.setBalance(new BigDecimal("337220.00"));
            current.setBranch(branch);
            accounts.save(current);

            BankCard card = new BankCard();
            card.setUser(u);
            card.setCardNumberMasked(cardMaskedNumber);
            card.setHolderName(cardHolderName);
            card.setType(BankCard.CardType.DEBIT);
            card.setStatus(BankCard.CardStatus.ACTIVE);
            card.setExpiryDate(LocalDate.of(2028, 12, 31));
            card.setDailyLimit(100000);
            cards.save(card);

            Beneficiary b = new Beneficiary();
            b.setUser(u);
            b.setName(beneficiaryName);
            b.setAccountNumber(beneficiaryAccountNumber);
            b.setBankName(beneficiaryBankName);
            b.setIfsc(beneficiaryIfsc);
            beneficiaries.save(b);

            Loan loan = new Loan();
            loan.setUser(u);
            loan.setType(Loan.LoanType.PERSONAL);
            loan.setLoanAmount(new BigDecimal(loanAmount));
            loan.setOutstandingAmount(new BigDecimal(loanOutstandingAmount));
            loan.setEmiAmount(new BigDecimal(loanEmiAmount));
            loan.setNextEmiDate(LocalDate.now().plusDays(5));
            loan.setStatus(Loan.LoanStatus.ACTIVE);
            loans.save(loan);
        };
    }
}
