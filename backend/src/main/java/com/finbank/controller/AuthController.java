package com.finbank.controller;

import com.finbank.dto.*;
import com.finbank.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

<<<<<<< HEAD
import java.util.Locale;
=======
>>>>>>> origin/master
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(
            @Valid @RequestBody SignupRequest request) {
        return ResponseEntity.ok(authService.signup(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

<<<<<<< HEAD
    @PostMapping({"/send-otp", "/send-login-otp", "/signup/send-otp"})
    public ResponseEntity<OtpSendResponse> sendOtp(
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String purpose,
            @RequestBody(required = false) Map<String, String> body) {
        String resolvedEmail = email;
        String resolvedPurpose = purpose;
=======
    @PostMapping({"/send-otp", "/send-login-otp"})
    public ResponseEntity<OtpSendResponse> sendOtp(
            @RequestParam(required = false) String email,
            @RequestBody(required = false) Map<String, String> body) {
        String resolvedEmail = email;
>>>>>>> origin/master
        if (resolvedEmail == null && body != null) {
            resolvedEmail = body.get("email");
            if (resolvedEmail == null) {
                resolvedEmail = body.get("emailAddress");
            }
        }
<<<<<<< HEAD
        if (resolvedPurpose == null && body != null) {
            resolvedPurpose = body.get("purpose");
        }
        if (resolvedEmail == null || resolvedEmail.isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }

        String normalizedEmail = resolvedEmail.trim().toLowerCase();
        String normalizedPurpose = (resolvedPurpose == null || resolvedPurpose.isBlank())
                ? "LOGIN"
                : resolvedPurpose.trim().toUpperCase(Locale.ROOT);
        return ResponseEntity.ok(new OtpSendResponse(
                normalizedEmail,
                authService.sendOtp(normalizedEmail, normalizedPurpose)));
=======
        if (resolvedEmail == null || resolvedEmail.isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        String normalizedEmail = resolvedEmail.trim().toLowerCase();
        return ResponseEntity.ok(new OtpSendResponse(
                normalizedEmail,
                authService.sendLoginOtp(normalizedEmail)));
>>>>>>> origin/master
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<AuthResponse> verifyOtp(
<<<<<<< HEAD
            @RequestParam(required = false) String purpose,
            @Valid @RequestBody OtpRequest request) {
        String resolvedPurpose = purpose != null ? purpose : request.purpose();
        String normalizedPurpose = (resolvedPurpose == null || resolvedPurpose.isBlank()) ? "LOGIN" : resolvedPurpose.trim().toUpperCase(Locale.ROOT);
        return ResponseEntity.ok(authService.verifyOtp(request, normalizedPurpose));
    }

    @PostMapping("/signup/verify-otp")
    public ResponseEntity<AuthResponse> verifySignupOtp(
            @Valid @RequestBody OtpRequest request) {
        return ResponseEntity.ok(authService.verifySignupOtp(request));
=======
            @Valid @RequestBody OtpRequest request) {
        return ResponseEntity.ok(authService.verifyLoginOtp(request));
>>>>>>> origin/master
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(authService.forgotPassword(request));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(authService.resetPassword(request));
    }
}
