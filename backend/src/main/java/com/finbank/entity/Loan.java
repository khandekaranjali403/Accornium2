package com.finbank.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "loans")
public class Loan {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LoanType type;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal loanAmount;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal outstandingAmount;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal emiAmount;

    @Column(nullable = false)
    private LocalDate nextEmiDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LoanStatus status = LoanStatus.ACTIVE;

    public enum LoanType { PERSONAL, HOME, CAR, EDUCATION }
    public enum LoanStatus { ACTIVE, CLOSED, OVERDUE }

    public Long getId() { return id; }
    @JsonIgnore
    public User getUser() { return user; }
    public LoanType getType() { return type; }
    public BigDecimal getLoanAmount() { return loanAmount; }
    public BigDecimal getOutstandingAmount() { return outstandingAmount; }
    public BigDecimal getEmiAmount() { return emiAmount; }
    public LocalDate getNextEmiDate() { return nextEmiDate; }
    public LoanStatus getStatus() { return status; }

    public void setUser(User user) { this.user = user; }
    public void setType(LoanType type) { this.type = type; }
    public void setLoanAmount(BigDecimal loanAmount) { this.loanAmount = loanAmount; }
    public void setOutstandingAmount(BigDecimal outstandingAmount) { this.outstandingAmount = outstandingAmount; }
    public void setEmiAmount(BigDecimal emiAmount) { this.emiAmount = emiAmount; }
    public void setNextEmiDate(LocalDate nextEmiDate) { this.nextEmiDate = nextEmiDate; }
    public void setStatus(LoanStatus status) { this.status = status; }
}
