package com.finbank.controller;
import com.finbank.service.BankingService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/statements")
public class StatementController {
    private final BankingService service;
    public StatementController(BankingService service) { this.service = service; }

    @GetMapping public Object all(Authentication a) { return service.statements(a.getName()); }

    @PostMapping("/generate")
    public Object generate(Authentication a, @RequestParam Long accountId,
                           @RequestParam String period) {
        return service.generateStatement(a.getName(), accountId, period);
    }
}
