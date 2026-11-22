package com.finbank.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
public class Transaction {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Account account;

    @Column(nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal balanceAfter;

    @Column(nullable = false)
    private LocalDateTime transactionDate = LocalDateTime.now();

    public enum TransactionType { CREDIT, DEBIT }

    public Long getId() { return id; }
    public Account getAccount() { return account; }
    public String getDescription() { return description; }
    public TransactionType getType() { return type; }
    public BigDecimal getAmount() { return amount; }
    public BigDecimal getBalanceAfter() { return balanceAfter; }
    public LocalDateTime getTransactionDate() { return transactionDate; }

    public void setAccount(Account account) { this.account = account; }
    public void setDescription(String description) { this.description = description; }
    public void setType(TransactionType type) { this.type = type; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public void setBalanceAfter(BigDecimal balanceAfter) { this.balanceAfter = balanceAfter; }
}
