package com.finbank.repository;
import com.finbank.entity.BankCard;
import com.finbank.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface BankCardRepository extends JpaRepository<BankCard, Long> {
    List<BankCard> findByUser(User user);
    Optional<BankCard> findByIdAndUser(Long id, User user);
}
