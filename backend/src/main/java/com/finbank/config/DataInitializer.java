package com.finbank.config;

import com.finbank.entity.*;
import com.finbank.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner seed(UserRepository users, AccountRepository accounts,
                           BankCardRepository cards, LoanRepository loans,
                           BeneficiaryRepository beneficiaries,
                           PasswordEncoder encoder) {
        return args -> {
            if (users.existsByEmailIgnoreCase("anjali@gmail.com")) return;

            User u = new User();
            u.setName("Anjali Sharma");
            u.setEmail("anjali@gmail.com");
            u.setPassword(encoder.encode("Password@123"));
            u.setRole(User.Role.CUSTOMER);
            users.save(u);

            Account savings = new Account();
            savings.setUser(u);
            savings.setAccountNumber("123456789012");
            savings.setType(Account.AccountType.SAVINGS);
            savings.setBalance(new BigDecimal("245120.50"));
            savings.setBranch("Andheri, Mumbai");
            accounts.save(savings);

            Account current = new Account();
            current.setUser(u);
            current.setAccountNumber("987654321098");
            current.setType(Account.AccountType.CURRENT);
            current.setBalance(new BigDecimal("337220.00"));
            current.setBranch("Andheri, Mumbai");
            accounts.save(current);

            BankCard card = new BankCard();
            card.setUser(u);
            card.setCardNumberMasked("**** **** **** 1234");
            card.setHolderName("ANJALI SHARMA");
            card.setType(BankCard.CardType.DEBIT);
            card.setStatus(BankCard.CardStatus.ACTIVE);
            card.setExpiryDate(LocalDate.of(2028, 12, 31));
            card.setDailyLimit(100000);
            cards.save(card);

            Beneficiary b = new Beneficiary();
            b.setUser(u); b.setName("Rohan Mehta"); b.setAccountNumber("1234567890");
            b.setBankName("HDFC BANK"); b.setIfsc("HDFC0001234");
            beneficiaries.save(b);

            Loan loan = new Loan();
            loan.setUser(u); loan.setType(Loan.LoanType.PERSONAL);
            loan.setLoanAmount(new BigDecimal("500000"));
            loan.setOutstandingAmount(new BigDecimal("280000"));
            loan.setEmiAmount(new BigDecimal("12500"));
            loan.setNextEmiDate(LocalDate.now().plusDays(5));
            loan.setStatus(Loan.LoanStatus.ACTIVE);
            loans.save(loan);
        };
    }
}
