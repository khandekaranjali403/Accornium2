package com.finbank.controller;
import com.finbank.service.BankingService;
<<<<<<< HEAD
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
=======
>>>>>>> origin/master
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
<<<<<<< HEAD

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> download(Authentication a, @PathVariable Long id,
                                           @RequestParam(defaultValue = "csv") String format) {
        BankingService.StatementFile file = service.downloadStatement(a.getName(), id, format);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(file.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(file.fileName()).build().toString())
                .body(file.content());
    }
=======
>>>>>>> origin/master
}
