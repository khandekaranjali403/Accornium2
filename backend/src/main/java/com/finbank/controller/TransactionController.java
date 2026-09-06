package com.finbank.controller;
import com.finbank.service.BankingService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {
    private final BankingService service;
    public TransactionController(BankingService service) { this.service = service; }

    @GetMapping public Object all(Authentication a) { return service.transactions(a.getName()); }
}
