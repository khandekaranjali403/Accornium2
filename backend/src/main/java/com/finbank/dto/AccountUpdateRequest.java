package com.finbank.dto;

import com.finbank.entity.Account;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AccountUpdateRequest(
        @NotNull Account.AccountType type,
        @NotBlank String branch
) {}
