package com.parfumshop.service;

import com.parfumshop.dto.response.DashboardStatsResponse;
import com.parfumshop.enums.OrderStatus;
import com.parfumshop.repository.OrderRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Test
    void calculatesSalesMetricsFromPaidOrdersOnly() {
        Set<OrderStatus> paidStatuses = Set.of(
                OrderStatus.CONFIRMED,
                OrderStatus.SHIPPED,
                OrderStatus.DELIVERED
        );
        when(orderRepository.calculateTotalRevenue(paidStatuses))
                .thenReturn(new BigDecimal("125.50"));
        when(orderRepository.countTotalItemsSold(paidStatuses)).thenReturn(4L);
        when(orderRepository.count()).thenReturn(3L);
        when(orderRepository.findMonthlyRevenue(paidStatuses)).thenReturn(List.of());
        when(orderRepository.findTopProducts(any(), any(Pageable.class))).thenReturn(List.of());

        DashboardStatsResponse result = new DashboardService(orderRepository).getDashboardStats();

        assertThat(result.getTotalRevenue()).isEqualByComparingTo("125.50");
        assertThat(result.getTotalItemsSold()).isEqualTo(4L);
        assertThat(result.getTotalOrders()).isEqualTo(3L);
    }
}
