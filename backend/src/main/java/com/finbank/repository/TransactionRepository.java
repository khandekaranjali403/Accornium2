package com.finbank.repository;
import com.finbank.entity.Account;
import com.finbank.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
<<<<<<< HEAD
import java.time.LocalDateTime;
=======
>>>>>>> origin/master
import java.util.List;
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findTop50ByAccountInOrderByTransactionDateDesc(List<Account> accounts);
    List<Transaction> findByAccountInOrderByTransactionDateDesc(List<Account> accounts);
<<<<<<< HEAD
    List<Transaction> findByAccountAndTransactionDateGreaterThanEqualAndTransactionDateLessThanOrderByTransactionDateAsc(
            Account account, LocalDateTime start, LocalDateTime end);
=======
>>>>>>> origin/master
}
