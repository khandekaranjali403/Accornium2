package com.finbank.repository;
import com.finbank.entity.Statement;
import com.finbank.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface StatementRepository extends JpaRepository<Statement, Long> {
    List<Statement> findByUserOrderByGeneratedAtDesc(User user);
}
