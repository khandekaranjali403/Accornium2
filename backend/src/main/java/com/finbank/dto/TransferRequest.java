package com.finbank.dto;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
public record TransferRequest(
    @NotNull Long sourceAccountId,
    @NotNull Long beneficiaryId,
    @NotNull @DecimalMin("0.01") BigDecimal amount,
    String remarks
) {}
