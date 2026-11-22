package com.finbank.config;

import com.finbank.entity.*;
import com.finbank.repository.*;
<<<<<<< HEAD
import org.springframework.beans.factory.annotation.Value;
=======
>>>>>>> origin/master
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;

@Configuration
public class DataInitializer {

<<<<<<< HEAD
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

=======
>>>>>>> origin/master
    @Bean
    CommandLineRunner seed(UserRepository users, AccountRepository accounts,
                           BankCardRepository cards, LoanRepository loans,
                           BeneficiaryRepository beneficiaries,
                           PasswordEncoder encoder) {
        return args -> {
<<<<<<< HEAD
            if (users.existsByEmailIgnoreCase(demoUserEmail)) return;

            User u = new User();
            u.setName(demoUserName);
            u.setEmail(demoUserEmail);
            u.setPassword(encoder.encode(demoUserPassword));
=======
            if (users.existsByEmailIgnoreCase("anjali@gmail.com")) return;

            User u = new User();
            u.setName("Anjali Sharma");
            u.setEmail("anjali@gmail.com");
            u.setPassword(encoder.encode("Password@123"));
>>>>>>> origin/master
            u.setRole(User.Role.CUSTOMER);
            users.save(u);

            Account savings = new Account();
            savings.setUser(u);
<<<<<<< HEAD
            savings.setAccountNumber(savingsAccountNumber);
            savings.setType(Account.AccountType.SAVINGS);
            savings.setBalance(new BigDecimal("245120.50"));
            savings.setBranch(branch);
=======
            savings.setAccountNumber("123456789012");
            savings.setType(Account.AccountType.SAVINGS);
            savings.setBalance(new BigDecimal("245120.50"));
            savings.setBranch("Andheri, Mumbai");
>>>>>>> origin/master
            accounts.save(savings);

            Account current = new Account();
            current.setUser(u);
<<<<<<< HEAD
            current.setAccountNumber(currentAccountNumber);
            current.setType(Account.AccountType.CURRENT);
            current.setBalance(new BigDecimal("337220.00"));
            current.setBranch(branch);
=======
            current.setAccountNumber("987654321098");
            current.setType(Account.AccountType.CURRENT);
            current.setBalance(new BigDecimal("337220.00"));
            current.setBranch("Andheri, Mumbai");
>>>>>>> origin/master
            accounts.save(current);

            BankCard card = new BankCard();
            card.setUser(u);
<<<<<<< HEAD
            card.setCardNumberMasked(cardMaskedNumber);
            card.setHolderName(cardHolderName);
=======
            card.setCardNumberMasked("**** **** **** 1234");
            card.setHolderName("ANJALI SHARMA");
>>>>>>> origin/master
            card.setType(BankCard.CardType.DEBIT);
            card.setStatus(BankCard.CardStatus.ACTIVE);
            card.setExpiryDate(LocalDate.of(2028, 12, 31));
            card.setDailyLimit(100000);
            cards.save(card);

            Beneficiary b = new Beneficiary();
<<<<<<< HEAD
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
=======
            b.setUser(u); b.setName("Rohan Mehta"); b.setAccountNumber("1234567890");
            b.setBankName("HDFC BANK"); b.setIfsc("HDFC0001234");
            beneficiaries.save(b);

            Loan loan = new Loan();
            loan.setUser(u); loan.setType(Loan.LoanType.PERSONAL);
            loan.setLoanAmount(new BigDecimal("500000"));
            loan.setOutstandingAmount(new BigDecimal("280000"));
            loan.setEmiAmount(new BigDecimal("12500"));
>>>>>>> origin/master
            loan.setNextEmiDate(LocalDate.now().plusDays(5));
            loan.setStatus(Loan.LoanStatus.ACTIVE);
            loans.save(loan);
        };
    }
}
