package com.finbank.service;

import com.finbank.entity.OtpCode;
import com.finbank.repository.OtpRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class OtpService {

    private final OtpRepository otpRepository;
    private final long expirationMinutes;
    private final EmailService emailService;

    @org.springframework.beans.factory.annotation.Autowired
    public OtpService(
            OtpRepository otpRepository,
            @Value("${app.otp.expiration-minutes}") long expirationMinutes,
            EmailService emailService) {
        this.otpRepository = otpRepository;
        this.expirationMinutes = expirationMinutes;
        this.emailService = emailService;
    }

    public OtpService(OtpRepository otpRepository, long expirationMinutes) {
        this(otpRepository, expirationMinutes, null);
    }

    public String createOtp(String email, String purpose) {
        String code = String.format("%06d",
                ThreadLocalRandom.current().nextInt(0, 1_000_000));

        OtpCode otp = new OtpCode();
        otp.setEmail(email);
        otp.setCode(code);
        otp.setPurpose(purpose);
        otp.setExpiresAt(LocalDateTime.now().plusMinutes(expirationMinutes));
        otp.setUsed(false);

        if (emailService == null) {
            System.out.println("DEMO OTP for " + email + ": " + code);
        } else {
            emailService.sendOtp(email, code, purpose, expirationMinutes);
        }

        otpRepository.save(otp);

        return code;
    }

    public boolean verify(String email, String purpose, String code) {
        return otpRepository
                .findTopByEmailIgnoreCaseAndPurposeAndUsedFalseOrderByIdDesc(email, purpose)
                .filter(otp -> otp.getCode().equals(code))
                .filter(otp -> otp.getExpiresAt().isAfter(LocalDateTime.now()))
                .map(otp -> {
                    otp.setUsed(true);
                    otpRepository.save(otp);
                    return true;
                })
                .orElse(false);
    }
}
