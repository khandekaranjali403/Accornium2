package com.finbank.service;

import com.finbank.entity.User;
import com.finbank.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserLookupService {
    private final UserRepository userRepository;
    public UserLookupService(UserRepository userRepository) { this.userRepository = userRepository; }

    public User byEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }
}
