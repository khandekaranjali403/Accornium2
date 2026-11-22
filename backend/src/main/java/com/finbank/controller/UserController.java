package com.finbank.controller;

import com.finbank.entity.User;
import com.finbank.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public Map<String, Object> me(Authentication authentication) {
        User user = userRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow();

        return Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole().name()
        );
    }
}
