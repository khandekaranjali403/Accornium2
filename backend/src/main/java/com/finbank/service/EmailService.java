package com.finbank.service;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final boolean enabled;
    private final String from;

    public EmailService(
            ObjectProvider<JavaMailSender> mailSenderProvider,
            @Value("${app.mail.enabled:false}") boolean enabled,
            @Value("${app.mail.from:}") String from) {
        this.mailSender = mailSenderProvider.getIfAvailable();
        this.enabled = enabled;
        this.from = from;
    }

    public void sendOtp(String recipient, String code, String purpose, long expirationMinutes) {
        if (!enabled) {
            System.out.println("DEMO OTP for " + recipient + ": " + code);
            return;
        }

        if (mailSender == null || from.isBlank()) {
            throw new IllegalStateException("Email is enabled but SMTP settings are incomplete");
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(recipient);
        message.setSubject("FinBank verification code");
        message.setText("Your FinBank " + purpose.toLowerCase().replace('_', ' ')
                + " code is " + code + ". It expires in " + expirationMinutes + " minutes.");
        mailSender.send(message);
    }
}