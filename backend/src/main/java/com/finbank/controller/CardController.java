package com.finbank.controller;
import com.finbank.dto.CardApplicationRequest;
import com.finbank.service.BankingService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cards")
public class CardController {
    private final BankingService service;
    public CardController(BankingService service) { this.service = service; }

    @GetMapping public Object all(Authentication a) { return service.cards(a.getName()); }

    @PostMapping
    public Object apply(Authentication a, @Valid @RequestBody CardApplicationRequest request) {
        return service.applyForCreditCard(a.getName(), request);
    }

    @PatchMapping("/{id}/freeze")
    public Object freeze(Authentication a, @PathVariable Long id, @RequestParam boolean value) {
        return service.toggleCard(a.getName(), id, value);
    }
}
