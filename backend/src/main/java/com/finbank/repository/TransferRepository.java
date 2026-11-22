package com.finbank.repository;
import com.finbank.entity.Transfer;
import com.finbank.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface TransferRepository extends JpaRepository<Transfer, Long> {
    List<Transfer> findTop50ByUserOrderByCreatedAtDesc(User user);
}
