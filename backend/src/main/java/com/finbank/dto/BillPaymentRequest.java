package com.finbank.dto;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import com.finbank.entity.BillPayment;
public record BillPaymentRequest(
    @NotNull Long accountId,
    @NotNull BillPayment.BillType billType,
    @NotBlank String provider,
    @NotBlank String customerReference,
    @NotNull @DecimalMin("0.01") BigDecimal amount
) {}
