package com.finbank.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transfers")
public class Transfer {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Account sourceAccount;

    @ManyToOne(fetch = FetchType.LAZY)
    private Beneficiary beneficiary;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    private String remarks;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransferStatus status = TransferStatus.SUCCESS;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum TransferStatus { SUCCESS, FAILED, PENDING }

    public Long getId() { return id; }
    public User getUser() { return user; }
    public Account getSourceAccount() { return sourceAccount; }
    public Beneficiary getBeneficiary() { return beneficiary; }
    public BigDecimal getAmount() { return amount; }
    public String getRemarks() { return remarks; }
    public TransferStatus getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setUser(User user) { this.user = user; }
    public void setSourceAccount(Account sourceAccount) { this.sourceAccount = sourceAccount; }
    public void setBeneficiary(Beneficiary beneficiary) { this.beneficiary = beneficiary; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public void setStatus(TransferStatus status) { this.status = status; }
}
