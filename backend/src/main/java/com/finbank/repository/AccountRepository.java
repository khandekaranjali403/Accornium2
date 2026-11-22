package com.finbank.repository;
import com.finbank.entity.Account;
import com.finbank.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface AccountRepository extends JpaRepository<Account, Long> {
    List<Account> findByUser(User user);
    Optional<Account> findByIdAndUser(Long id, User user);
}
