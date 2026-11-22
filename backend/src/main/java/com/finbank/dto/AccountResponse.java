package com.finbank.dto;

import com.finbank.entity.Account;

import java.math.BigDecimal;

public record AccountResponse(
        Long id,
        String accountNumber,
        Account.AccountType type,
        BigDecimal balance,
        String branch,
        String accountHolder
) {
    public static AccountResponse from(Account account) {
        return new AccountResponse(
                account.getId(),
                account.getAccountNumber(),
                account.getType(),
                account.getBalance(),
                account.getBranch(),
                account.getUser().getName());
    }
}