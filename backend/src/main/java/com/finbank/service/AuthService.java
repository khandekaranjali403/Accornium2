package com.finbank.service;

import com.finbank.dto.*;
import com.finbank.entity.User;
import com.finbank.repository.UserRepository;
import com.finbank.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

<<<<<<< HEAD
import java.util.Locale;

=======
>>>>>>> origin/master
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final OtpService otpService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            OtpService otpService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.otpService = otpService;
    }

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        String email = request.email().trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("Email is already registered");
        }

        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(User.Role.CUSTOMER);
        user.setActive(true);

        userRepository.save(user);
<<<<<<< HEAD
        String token = jwtService.generateToken(user.getEmail(), user.getId());

        return new AuthResponse(token, user.getId(), user.getName(),
=======

        return new AuthResponse(null, user.getId(), user.getName(),
>>>>>>> origin/master
                user.getEmail(), "Signup successful");
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.email().trim())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!user.isActive() ||
                !passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        String token = jwtService.generateToken(user.getEmail(), user.getId());

        return new AuthResponse(token, user.getId(), user.getName(),
                user.getEmail(), "Login successful");
    }

<<<<<<< HEAD
    public String sendOtp(String email, String purpose) {
        String normalizedEmail = email == null ? "" : email.trim().toLowerCase();
        String normalizedPurpose = purpose == null || purpose.isBlank() ? "LOGIN" : purpose.trim().toUpperCase(Locale.ROOT);

        if (normalizedEmail.isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }

        otpService.createOtp(normalizedEmail, normalizedPurpose);
        return "OTP sent successfully";
    }

    public String sendLoginOtp(String email) {
        return sendOtp(email, "LOGIN");
    }

    public String sendSignupOtp(String email) {
        return sendOtp(email, "SIGNUP");
    }

    public AuthResponse verifyOtp(OtpRequest request, String purpose) {
        String normalizedEmail = request.email().trim().toLowerCase();
        String normalizedPurpose = purpose == null || purpose.isBlank() ? "LOGIN" : purpose.trim().toUpperCase(Locale.ROOT);

        boolean valid = otpService.verify(normalizedEmail, normalizedPurpose, request.otp());
=======
    public String sendLoginOtp(String email) {
        String normalizedEmail = email.trim().toLowerCase();
        otpService.createOtp(normalizedEmail, "LOGIN");
        return "OTP sent successfully";
    }

    public AuthResponse verifyLoginOtp(OtpRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.email().trim())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        boolean valid = otpService.verify(
                request.email().trim().toLowerCase(),
                "LOGIN",
                request.otp()
        );

>>>>>>> origin/master
        if (!valid) {
            throw new IllegalArgumentException("Invalid or expired OTP");
        }

<<<<<<< HEAD
        if ("SIGNUP".equals(normalizedPurpose)) {
            User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            if (!user.isActive()) {
                throw new IllegalArgumentException("Account is inactive");
            }
            String token = jwtService.generateToken(user.getEmail(), user.getId());
            return new AuthResponse(token, user.getId(), user.getName(),
                    user.getEmail(), "OTP verified successfully");
        }

        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (!user.isActive()) {
            throw new IllegalArgumentException("Account is inactive");
        }

=======
>>>>>>> origin/master
        String token = jwtService.generateToken(user.getEmail(), user.getId());

        return new AuthResponse(token, user.getId(), user.getName(),
                user.getEmail(), "OTP login successful");
    }

<<<<<<< HEAD
    public AuthResponse verifyLoginOtp(OtpRequest request) {
        return verifyOtp(request, "LOGIN");
    }

    public AuthResponse verifySignupOtp(OtpRequest request) {
        return verifyOtp(request, "SIGNUP");
    }

=======
>>>>>>> origin/master
    public String forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmailIgnoreCase(request.email().trim())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        otpService.createOtp(request.email().trim().toLowerCase(), "RESET_PASSWORD");
        return "Password reset OTP sent successfully";
    }

    @Transactional
    public String resetPassword(ResetPasswordRequest request) {
        String email = request.email().trim().toLowerCase();

        boolean valid = otpService.verify(email, "RESET_PASSWORD", request.otp());

        if (!valid) {
            throw new IllegalArgumentException("Invalid or expired OTP");
        }

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        return "Password reset successful";
    }
}
