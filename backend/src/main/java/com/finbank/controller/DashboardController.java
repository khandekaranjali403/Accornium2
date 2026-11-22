package com.finbank.controller;
import com.finbank.service.BankingService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final BankingService service;
    public DashboardController(BankingService service) { this.service = service; }

    @GetMapping
    public Map<String,Object> dashboard(Authentication auth) {
        return service.dashboard(auth.getName());
    }
}
