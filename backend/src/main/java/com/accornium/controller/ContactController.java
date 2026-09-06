package com.accornium.controller;

import com.accornium.model.ContactMessage;
import com.accornium.repository.ContactMessageRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ContactController {

    private final ContactMessageRepository repository;

    public ContactController(ContactMessageRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "company", "Accornium"));
    }

    @PostMapping("/contact")
    public ResponseEntity<ContactMessage> submitContact(@Valid @RequestBody ContactMessage contactMessage) {
        ContactMessage saved = repository.save(contactMessage);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/contact")
    public ResponseEntity<List<ContactMessage>> getAllMessages() {
        return ResponseEntity.ok(repository.findAll());
    }
}
