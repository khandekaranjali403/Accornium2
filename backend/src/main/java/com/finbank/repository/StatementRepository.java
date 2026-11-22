package com.finbank.repository;
import com.finbank.entity.Statement;
import com.finbank.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
<<<<<<< HEAD
import java.util.Optional;
public interface StatementRepository extends JpaRepository<Statement, Long> {
    List<Statement> findByUserOrderByGeneratedAtDesc(User user);
    Optional<Statement> findByIdAndUser(Long id, User user);
=======
public interface StatementRepository extends JpaRepository<Statement, Long> {
    List<Statement> findByUserOrderByGeneratedAtDesc(User user);
>>>>>>> origin/master
}
