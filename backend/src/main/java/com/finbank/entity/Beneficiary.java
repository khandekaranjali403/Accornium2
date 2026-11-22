package com.finbank.entity;

<<<<<<< HEAD
import com.fasterxml.jackson.annotation.JsonIgnore;
=======
>>>>>>> origin/master
import jakarta.persistence.*;

@Entity
@Table(name = "beneficiaries")
public class Beneficiary {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private User user;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String accountNumber;

    @Column(nullable = false)
    private String bankName;

    @Column(nullable = false)
    private String ifsc;

    public Long getId() { return id; }
<<<<<<< HEAD
    @JsonIgnore
=======
>>>>>>> origin/master
    public User getUser() { return user; }
    public String getName() { return name; }
    public String getAccountNumber() { return accountNumber; }
    public String getBankName() { return bankName; }
    public String getIfsc() { return ifsc; }

    public void setUser(User user) { this.user = user; }
    public void setName(String name) { this.name = name; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }
    public void setBankName(String bankName) { this.bankName = bankName; }
    public void setIfsc(String ifsc) { this.ifsc = ifsc; }
}
