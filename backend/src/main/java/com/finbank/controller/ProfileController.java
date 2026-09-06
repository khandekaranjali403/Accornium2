package com.finbank.controller;
import com.finbank.entity.User;
import com.finbank.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {
    private final UserRepository users;
    public ProfileController(UserRepository users) { this.users = users; }

    @GetMapping
    public Object get(Authentication auth) {
        User u = users.findByEmailIgnoreCase(auth.getName()).orElseThrow();
        return Map.of("id", u.getId(), "name", u.getName(), "email", u.getEmail(),
                "role", u.getRole().name(), "active", u.isActive(), "createdAt", u.getCreatedAt());
    }

    @PutMapping
    public Object update(Authentication auth, @RequestBody Map<String,String> body) {
        User u = users.findByEmailIgnoreCase(auth.getName()).orElseThrow();
        if (body.containsKey("name") && !body.get("name").isBlank()) u.setName(body.get("name").trim());
        users.save(u);
        return Map.of("message", "Profile updated", "name", u.getName(), "email", u.getEmail());
    }
}
