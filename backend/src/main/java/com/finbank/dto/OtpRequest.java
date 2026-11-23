package com.finbank.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record OtpRequest(
        @JsonAlias({"emailAddress", "userEmail"})
        @NotBlank @Email String email,
        @JsonAlias("code")
        @NotBlank @Pattern(regexp = "\\d{6}", message = "OTP must contain 6 digits")
        String otp,
        @JsonAlias({"purpose", "verificationType"})
        String purpose
) {
    public OtpRequest(String email, String otp) {
        this(email, otp, null);
    }
}
