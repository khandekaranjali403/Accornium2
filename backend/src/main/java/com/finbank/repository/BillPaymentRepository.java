package com.finbank.repository;
import com.finbank.entity.BillPayment;
import com.finbank.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface BillPaymentRepository extends JpaRepository<BillPayment, Long> {
    List<BillPayment> findTop50ByUserOrderByPaidAtDesc(User user);
}
