package com.finbank.repository;
import com.finbank.entity.Loan;
import com.finbank.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface LoanRepository extends JpaRepository<Loan, Long> {
    List<Loan> findByUserOrderByNextEmiDateAsc(User user);
    Optional<Loan> findByIdAndUser(Long id, User user);
}
