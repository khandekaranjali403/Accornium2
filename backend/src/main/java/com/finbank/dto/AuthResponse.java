package com.finbank.dto;

public record AuthResponse(
        String token,
        Long userId,
        String name,
        String email,
        String message
) {}
