package com.finbank.controller;
import com.finbank.dto.BillPaymentRequest;
import com.finbank.service.BankingService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class BillPaymentController {
    private final BankingService service;
    public BillPaymentController(BankingService service) { this.service = service; }

    @GetMapping("/bills") public Object history(Authentication a) { return service.bills(a.getName()); }

    @PostMapping("/bills")
    public Object pay(Authentication a, @Valid @RequestBody BillPaymentRequest r) {
        return service.payBill(a.getName(), r);
    }
}
