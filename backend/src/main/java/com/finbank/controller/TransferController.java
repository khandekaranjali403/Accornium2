package com.finbank.controller;
import com.finbank.dto.TransferRequest;
import com.finbank.service.BankingService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transfers")
public class TransferController {
    private final BankingService service;
    public TransferController(BankingService service) { this.service = service; }

    @GetMapping public Object all(Authentication a) { return service.transfers(a.getName()); }

    @PostMapping
    public Object transfer(Authentication a, @Valid @RequestBody TransferRequest r) {
        return service.transfer(a.getName(), r);
    }
}
