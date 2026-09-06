package com.finbank.controller;
import com.finbank.dto.AccountRequest;
import com.finbank.service.BankingService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {
    private final BankingService service;
    public AccountController(BankingService service) { this.service = service; }

    @GetMapping public Object all(Authentication a) { return service.accounts(a.getName()); }
    @PostMapping public Object create(Authentication a, @Valid @RequestBody AccountRequest r) {
        return service.createAccount(a.getName(), r);
    }
}
