package com.finbank.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "bank_cards")
public class BankCard {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private User user;

    @Column(nullable = false, length = 19)
    private String cardNumberMasked;

    @Column(nullable = false)
    private String holderName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CardType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CardStatus status = CardStatus.ACTIVE;

    @Column(nullable = false)
    private LocalDate expiryDate;

    private int dailyLimit;

    public enum CardType { DEBIT, CREDIT }
    public enum CardStatus { ACTIVE, FROZEN, BLOCKED }

    public Long getId() { return id; }
    public User getUser() { return user; }
    public String getCardNumberMasked() { return cardNumberMasked; }
    public String getHolderName() { return holderName; }
    public CardType getType() { return type; }
    public CardStatus getStatus() { return status; }
    public LocalDate getExpiryDate() { return expiryDate; }
    public int getDailyLimit() { return dailyLimit; }

    public void setUser(User user) { this.user = user; }
    public void setCardNumberMasked(String cardNumberMasked) { this.cardNumberMasked = cardNumberMasked; }
    public void setHolderName(String holderName) { this.holderName = holderName; }
    public void setType(CardType type) { this.type = type; }
    public void setStatus(CardStatus status) { this.status = status; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }
    public void setDailyLimit(int dailyLimit) { this.dailyLimit = dailyLimit; }
}
