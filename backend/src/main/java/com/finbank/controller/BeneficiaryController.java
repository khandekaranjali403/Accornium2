package com.finbank.controller;
import com.finbank.dto.BeneficiaryRequest;
import com.finbank.service.BankingService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/beneficiaries")
public class BeneficiaryController {
    private final BankingService service;
    public BeneficiaryController(BankingService service) { this.service = service; }

    @GetMapping public Object all(Authentication a) { return service.beneficiaries(a.getName()); }

    @PostMapping public Object add(Authentication a, @Valid @RequestBody BeneficiaryRequest r) {
        return service.addBeneficiary(a.getName(), r);
    }
}
