package com.finbank.dto;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import com.finbank.entity.Account;
public record AccountRequest(
    @NotNull Account.AccountType type,
    BigDecimal openingBalance,
    String branch
) {}
