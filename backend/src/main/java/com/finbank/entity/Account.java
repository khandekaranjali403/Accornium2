package com.finbank.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "accounts")
public class Account {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private User user;

    @Column(nullable = false, unique = true, length = 30)
    private String accountNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccountType type;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal balance = BigDecimal.ZERO;

    @Column(nullable = false)
    private String branch;

    public enum AccountType { SAVINGS, CURRENT }

    public Long getId() { return id; }
    public User getUser() { return user; }
    public String getAccountNumber() { return accountNumber; }
    public AccountType getType() { return type; }
    public BigDecimal getBalance() { return balance; }
    public String getBranch() { return branch; }

    public void setUser(User user) { this.user = user; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }
    public void setType(AccountType type) { this.type = type; }
    public void setBalance(BigDecimal balance) { this.balance = balance; }
    public void setBranch(String branch) { this.branch = branch; }
}
