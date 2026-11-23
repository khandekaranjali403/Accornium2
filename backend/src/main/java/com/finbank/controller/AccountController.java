package com.finbank.controller;
import com.finbank.dto.AccountRequest;
import com.finbank.dto.AccountResponse;
import com.finbank.dto.AccountUpdateRequest;
import com.finbank.service.BankingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {
    private final BankingService service;
    public AccountController(BankingService service) { this.service = service; }

    @GetMapping
    public List<AccountResponse> all(Authentication a) {
        return service.accounts(a.getName()).stream().map(AccountResponse::from).toList();
    }
    @GetMapping("/{id}")
    public AccountResponse details(Authentication a, @PathVariable Long id) {
        return AccountResponse.from(service.account(a.getName(), id));
    }

    @PutMapping("/{id}")
    public AccountResponse update(Authentication a, @PathVariable Long id,
                                  @Valid @RequestBody AccountUpdateRequest request) {
        return AccountResponse.from(service.updateAccount(a.getName(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(Authentication a, @PathVariable Long id) {
        service.deleteAccount(a.getName(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    public AccountResponse create(Authentication a, @Valid @RequestBody AccountRequest r) {
        return AccountResponse.from(service.createAccount(a.getName(), r));
    }
}
