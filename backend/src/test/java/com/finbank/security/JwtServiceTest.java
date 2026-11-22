package com.finbank.security;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {
    private static final String SECRET = "01234567890123456789012345678901";

    @Test
    void generatesTokenWithEmailAndAcceptsItAsValid() {
        JwtService service = new JwtService(SECRET, 60_000);

        String token = service.generateToken("user@example.com", 7L);

        assertEquals("user@example.com", service.extractEmail(token));
        assertTrue(service.isValid(token));
    }

    @Test
    void rejectsShortSecret() {
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> new JwtService("too-short", 60_000));

        assertEquals("JWT secret must be at least 32 characters.", exception.getMessage());
    }

    @Test
    void rejectsTamperedToken() {
        JwtService service = new JwtService(SECRET, 60_000);
        String token = service.generateToken("user@example.com", 7L);

        assertFalse(service.isValid(token + "tampered"));
    }

    @Test
    void rejectsExpiredToken() {
        JwtService service = new JwtService(SECRET, -1);
        String token = service.generateToken("user@example.com", 7L);

        assertFalse(service.isValid(token));
    }
}