package com.finbank.service;

import com.finbank.entity.OtpCode;
import com.finbank.repository.OtpRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OtpServiceTest {
    @Mock OtpRepository otpRepository;
    private OtpService otpService;

    @org.junit.jupiter.api.BeforeEach
    void setUp() {
        otpService = new OtpService(otpRepository, 5);
    }

    @Test
    void createOtpPersistsSixDigitUnexpiredCode() {
        String code = otpService.createOtp("user@example.com", "LOGIN");

        assertTrue(code.matches("\\d{6}"));
        ArgumentCaptor<OtpCode> captor = ArgumentCaptor.forClass(OtpCode.class);
        verify(otpRepository).save(captor.capture());
        OtpCode saved = captor.getValue();
        assertEquals("user@example.com", saved.getEmail());
        assertEquals(code, saved.getCode());
        assertEquals("LOGIN", saved.getPurpose());
        assertFalse(saved.isUsed());
        assertTrue(saved.getExpiresAt().isAfter(LocalDateTime.now()));
    }

    @Test
    void verifyMarksMatchingUnexpiredCodeUsed() {
        OtpCode otp = otp("123456", LocalDateTime.now().plusMinutes(1));
        when(otpRepository.findTopByEmailIgnoreCaseAndPurposeAndUsedFalseOrderByIdDesc("user@example.com", "LOGIN"))
                .thenReturn(Optional.of(otp));

        assertTrue(otpService.verify("user@example.com", "LOGIN", "123456"));

        assertTrue(otp.isUsed());
        verify(otpRepository).save(otp);
    }

    @Test
    void verifyRejectsWrongCodeOrExpiredCode() {
        OtpCode otp = otp("123456", LocalDateTime.now().minusMinutes(1));
        when(otpRepository.findTopByEmailIgnoreCaseAndPurposeAndUsedFalseOrderByIdDesc("user@example.com", "LOGIN"))
                .thenReturn(Optional.of(otp));

        assertFalse(otpService.verify("user@example.com", "LOGIN", "123456"));
        verify(otpRepository, never()).save(any(OtpCode.class));
    }

    private OtpCode otp(String code, LocalDateTime expiresAt) {
        OtpCode otp = new OtpCode();
        otp.setCode(code);
        otp.setExpiresAt(expiresAt);
        return otp;
    }
}
