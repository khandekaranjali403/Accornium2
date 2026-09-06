package com.finbank.dto;
import jakarta.validation.constraints.NotBlank;
public record BeneficiaryRequest(
    @NotBlank String name,
    @NotBlank String accountNumber,
    @NotBlank String bankName,
    @NotBlank String ifsc
) {}
