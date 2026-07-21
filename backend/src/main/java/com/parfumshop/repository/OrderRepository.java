package com.parfumshop.repository;

import com.parfumshop.dto.response.MonthlyRevenueResponse;
import com.parfumshop.dto.response.TopProductResponse;
import com.parfumshop.entity.Order;
import com.parfumshop.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Page<Order> findByUser_EmailIgnoreCaseOrderByCreatedAtDesc(String email, Pageable pageable);

    @Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT o FROM Order o WHERE o.id = :id")
    Optional<Order> findByIdForUpdate(@Param("id") Long id);

    @Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT o FROM Order o WHERE o.stripePaymentIntentId = :paymentIntentId")
    Optional<Order> findByStripePaymentIntentIdForUpdate(@Param("paymentIntentId") String paymentIntentId);

    List<Order> findByStatusAndCreatedAtBefore(OrderStatus status, LocalDateTime createdAt);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status IN :paidStatuses")
    BigDecimal calculateTotalRevenue(@Param("paidStatuses") Set<OrderStatus> paidStatuses);

    @Query("""
            SELECT new com.parfumshop.dto.response.MonthlyRevenueResponse(
                YEAR(o.createdAt),
                MONTH(o.createdAt),
                COALESCE(SUM(o.totalAmount), 0)
            )
            FROM Order o
            WHERE o.status IN :paidStatuses
            GROUP BY YEAR(o.createdAt), MONTH(o.createdAt)
            ORDER BY YEAR(o.createdAt) ASC, MONTH(o.createdAt) ASC
            """)
    List<MonthlyRevenueResponse> findMonthlyRevenue(@Param("paidStatuses") Set<OrderStatus> paidStatuses);

    @Query("""
            SELECT new com.parfumshop.dto.response.TopProductResponse(
                p.id,
                p.name,
                p.brand,
                SUM(oi.quantity),
                SUM(oi.subtotal)
            )
            FROM OrderItem oi
            JOIN oi.product p
            JOIN oi.order o
            WHERE o.status IN :paidStatuses
            GROUP BY p.id, p.name, p.brand
            ORDER BY SUM(oi.quantity) DESC
            """)
    List<TopProductResponse> findTopProducts(
            @Param("paidStatuses") Set<OrderStatus> paidStatuses,
            Pageable pageable);

    @Query("SELECT COALESCE(SUM(oi.quantity), 0) FROM OrderItem oi JOIN oi.order o WHERE o.status IN :paidStatuses")
    Long countTotalItemsSold(@Param("paidStatuses") Set<OrderStatus> paidStatuses);
}
