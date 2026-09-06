package com.finbank.controller;
import com.finbank.service.BankingService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final BankingService service;
    public NotificationController(BankingService service) { this.service = service; }

    @GetMapping public Object all(Authentication a) { return service.notifications(a.getName()); }

    @PatchMapping("/{id}/read")
    public Object read(Authentication a, @PathVariable Long id) {
        return service.markNotificationRead(a.getName(), id);
    }
}
