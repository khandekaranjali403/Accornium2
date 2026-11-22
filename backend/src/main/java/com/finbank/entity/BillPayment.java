package com.finbank.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bill_payments")
public class BillPayment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Account account;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BillType billType;

    @Column(nullable = false)
    private String provider;

    @Column(nullable = false)
    private String customerReference;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status = PaymentStatus.SUCCESS;

    @Column(nullable = false)
    private LocalDateTime paidAt = LocalDateTime.now();

    public enum BillType { MOBILE, ELECTRICITY, DTH, BROADBAND, WATER, GAS }
    public enum PaymentStatus { SUCCESS, FAILED, PENDING }

    public Long getId() { return id; }
    @JsonIgnore
    public User getUser() { return user; }
    public Account getAccount() { return account; }
    public BillType getBillType() { return billType; }
    public String getProvider() { return provider; }
    public String getCustomerReference() { return customerReference; }
    public BigDecimal getAmount() { return amount; }
    public PaymentStatus getStatus() { return status; }
    public LocalDateTime getPaidAt() { return paidAt; }

    public void setUser(User user) { this.user = user; }
    public void setAccount(Account account) { this.account = account; }
    public void setBillType(BillType billType) { this.billType = billType; }
    public void setProvider(String provider) { this.provider = provider; }
    public void setCustomerReference(String customerReference) { this.customerReference = customerReference; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public void setStatus(PaymentStatus status) { this.status = status; }
}
