package com.finbank.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.CUSTOMER;

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Role {
        CUSTOMER, ADMIN
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    @JsonIgnore
    public String getPassword() { return password; }
    public Role getRole() { return role; }
    public boolean isActive() { return active; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setName(String name) { this.name = name; }
    public void setEmail(String email) { this.email = email; }
    public void setPassword(String password) { this.password = password; }
    public void setRole(Role role) { this.role = role; }
    public void setActive(boolean active) { this.active = active; }
}
