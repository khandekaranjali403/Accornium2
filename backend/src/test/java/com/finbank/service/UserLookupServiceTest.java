package com.finbank.service;

import com.finbank.entity.User;
import com.finbank.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserLookupServiceTest {
    @Mock UserRepository userRepository;
    @InjectMocks UserLookupService userLookupService;

    @Test
    void byEmailReturnsUser() {
        User user = new User();
        user.setEmail("user@example.com");
        when(userRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(Optional.of(user));

        assertSame(user, userLookupService.byEmail("user@example.com"));
    }

    @Test
    void byEmailRejectsUnknownUser() {
        when(userRepository.findByEmailIgnoreCase("missing@example.com")).thenReturn(Optional.empty());

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> userLookupService.byEmail("missing@example.com"));

        assertEquals("User not found", exception.getMessage());
    }
}
