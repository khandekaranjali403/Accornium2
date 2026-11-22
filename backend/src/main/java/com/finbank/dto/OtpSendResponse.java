package com.finbank.dto;

public record OtpSendResponse(
        String email,
        String message
) {}