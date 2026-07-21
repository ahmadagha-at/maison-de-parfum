package com.parfumshop.service;

import com.parfumshop.entity.Order;
import com.parfumshop.enums.OrderStatus;
import com.parfumshop.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PendingOrderCleanupService {

    private final OrderRepository orderRepository;
    private final OrderService orderService;

    @Value("${application.orders.pending-timeout-minutes:30}")
    private long pendingTimeoutMinutes;

    @Scheduled(fixedDelayString = "${application.orders.cleanup-interval-ms:300000}")
    public void cancelExpiredPendingOrders() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(pendingTimeoutMinutes);
        List<Order> expiredOrders = orderRepository.findByStatusAndCreatedAtBefore(
                OrderStatus.PENDING, cutoff);

        for (Order order : expiredOrders) {
            try {
                orderService.cancelExpiredOrder(order.getId());
            } catch (Exception ex) {
                log.warn("Could not cancel expired order {}: {}", order.getId(), ex.getMessage());
            }
        }
    }
}
