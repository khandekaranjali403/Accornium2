package com.finbank.service;

import com.finbank.dto.AuthResponse;
import com.finbank.dto.LoginRequest;
import com.finbank.dto.OtpRequest;
import com.finbank.dto.SignupRequest;
import com.finbank.entity.User;
import com.finbank.repository.UserRepository;
import com.finbank.security.JwtService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {
    @Mock UserRepository userRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtService jwtService;
    @Mock OtpService otpService;
    @InjectMocks AuthService authService;

    @Test
    void signupNormalizesEmailAndSavesCustomer() {
        when(userRepository.existsByEmailIgnoreCase("user@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password")).thenReturn("encoded");

        AuthResponse response = authService.signup(new SignupRequest("  User  ", " USER@example.com ", "password"));

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        User saved = captor.getValue();
        assertEquals("User", saved.getName());
        assertEquals("user@example.com", saved.getEmail());
        assertEquals("encoded", saved.getPassword());
        assertEquals(User.Role.CUSTOMER, saved.getRole());
        assertTrue(saved.isActive());
        assertEquals("Signup successful", response.message());
    }

    @Test
    void signupRejectsRegisteredEmail() {
        when(userRepository.existsByEmailIgnoreCase("user@example.com")).thenReturn(true);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> authService.signup(new SignupRequest("User", " USER@example.com ", "password")));

        assertEquals("Email is already registered", exception.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    void loginReturnsTokenForActiveUser() {
        User user = user("user@example.com", "encoded");
        when(userRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password", "encoded")).thenReturn(true);
        when(jwtService.generateToken("user@example.com", null)).thenReturn("token");

        AuthResponse response = authService.login(new LoginRequest(" user@example.com ", "password"));

        assertEquals("token", response.token());
        assertEquals("user@example.com", response.email());
        assertEquals("Login successful", response.message());
    }

    @Test
    void loginRejectsInactiveOrIncorrectUser() {
        User user = user("user@example.com", "encoded");
        user.setActive(false);
        when(userRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(Optional.of(user));

        assertThrows(IllegalArgumentException.class,
                () -> authService.login(new LoginRequest("user@example.com", "password")));
        verify(passwordEncoder, never()).matches(anyString(), anyString());
    }

    @Test
    void verifyLoginOtpReturnsTokenWhenOtpIsValid() {
        User user = user("user@example.com", "encoded");
        when(userRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(Optional.of(user));
        when(otpService.verify("user@example.com", "LOGIN", "123456")).thenReturn(true);
        when(jwtService.generateToken("user@example.com", null)).thenReturn("otp-token");

        AuthResponse response = authService.verifyLoginOtp(new OtpRequest(" user@example.com ", "123456"));

        assertEquals("otp-token", response.token());
        assertEquals("OTP login successful", response.message());
    }

    @Test
    void sendLoginOtpReturnsGenericSuccessForUnknownEmail() {
        assertEquals("OTP sent successfully", authService.sendLoginOtp(" UNKNOWN@example.com "));

        verify(otpService).createOtp("unknown@example.com", "LOGIN");
        verify(userRepository, never()).findByEmailIgnoreCase(anyString());
    }

    @Test
    void verifyLoginOtpRejectsInvalidOtp() {
        when(userRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(Optional.of(user("user@example.com", "encoded")));
        when(otpService.verify("user@example.com", "LOGIN", "123456")).thenReturn(false);

        assertThrows(IllegalArgumentException.class,
                () -> authService.verifyLoginOtp(new OtpRequest("user@example.com", "123456")));
        verify(jwtService, never()).generateToken(anyString(), any());
    }

    private User user(String email, String password) {
        User user = new User();
        user.setEmail(email);
        user.setPassword(password);
        user.setName("User");
        return user;
    }
}
