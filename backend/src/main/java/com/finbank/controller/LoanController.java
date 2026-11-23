package com.finbank.controller;
import com.finbank.dto.LoanPaymentRequest;
import com.finbank.dto.LoanApplicationRequest;
import com.finbank.service.BankingService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/loans")
public class LoanController {
    private final BankingService service;
    public LoanController(BankingService service) { this.service = service; }

    @GetMapping public Object all(Authentication a) { return service.loans(a.getName()); }

    @PostMapping
    public Object apply(Authentication a, @Valid @RequestBody LoanApplicationRequest request) {
        return service.applyForLoan(a.getName(), request);
    }

    @PostMapping("/{id}/pay")
    public Object pay(Authentication a, @PathVariable Long id,
                      @Valid @RequestBody LoanPaymentRequest r) {
        return service.payLoan(a.getName(), id, r);
    }
}
