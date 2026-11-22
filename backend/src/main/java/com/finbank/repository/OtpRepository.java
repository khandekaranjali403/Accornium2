package com.finbank.repository;

import com.finbank.entity.OtpCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OtpRepository extends JpaRepository<OtpCode, Long> {
    Optional<OtpCode> findTopByEmailIgnoreCaseAndPurposeAndUsedFalseOrderByIdDesc(
            String email, String purpose);
}
