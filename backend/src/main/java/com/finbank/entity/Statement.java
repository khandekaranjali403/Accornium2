package com.finbank.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "statements")
public class Statement {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Account account;

    @Column(nullable = false)
    private String period;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private LocalDateTime generatedAt = LocalDateTime.now();

    public Long getId() { return id; }
    @JsonIgnore
    public User getUser() { return user; }
    public Account getAccount() { return account; }
    public String getPeriod() { return period; }
    public String getFileName() { return fileName; }
    public LocalDateTime getGeneratedAt() { return generatedAt; }

    public void setUser(User user) { this.user = user; }
    public void setAccount(Account account) { this.account = account; }
    public void setPeriod(String period) { this.period = period; }
    public void setFileName(String fileName) { this.fileName = fileName; }
}
