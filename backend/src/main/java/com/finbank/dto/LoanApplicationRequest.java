package com.finbank.dto;

import com.finbank.entity.Loan;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record LoanApplicationRequest(
        @NotNull(message = "Loan type is required")
        Loan.LoanType type,

        @NotNull(message = "Loan amount is required")
        @DecimalMin(value = "0.01", message = "Loan amount must be greater than zero")
        @Digits(integer = 17, fraction = 2, message = "Loan amount must have at most 2 decimal places")
        BigDecimal loanAmount,

        @NotNull(message = "EMI amount is required")
        @DecimalMin(value = "0.01", message = "EMI amount must be greater than zero")
        @Digits(integer = 17, fraction = 2, message = "EMI amount must have at most 2 decimal places")
        BigDecimal emiAmount
) {}
