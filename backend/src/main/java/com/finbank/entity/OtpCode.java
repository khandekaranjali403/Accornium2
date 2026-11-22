package com.finbank.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "otp_codes")
public class OtpCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String code;

    @Column(nullable = false)
    private String purpose;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private boolean used = false;

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getCode() { return code; }
    public String getPurpose() { return purpose; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public boolean isUsed() { return used; }

    public void setEmail(String email) { this.email = email; }
    public void setCode(String code) { this.code = code; }
    public void setPurpose(String purpose) { this.purpose = purpose; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
    public void setUsed(boolean used) { this.used = used; }
}
