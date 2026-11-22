package com.finbank.dto;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
public record LoanPaymentRequest(
    @NotNull Long accountId,
    @NotNull @DecimalMin("0.01") BigDecimal amount
) {}
