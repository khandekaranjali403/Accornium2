package com.finbank.dto;

import jakarta.validation.constraints.NotBlank;

public record CardApplicationRequest(
        @NotBlank(message = "Cardholder name is required")
        String holderName
) {}
