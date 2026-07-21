package com.parfumshop.service;

import com.parfumshop.dto.response.DashboardStatsResponse;
import com.parfumshop.dto.response.MonthlyRevenueResponse;
import com.parfumshop.dto.response.TopProductResponse;
import com.parfumshop.enums.OrderStatus;
import com.parfumshop.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private static final Set<OrderStatus> PAID_STATUSES = Set.of(
            OrderStatus.CONFIRMED,
            OrderStatus.SHIPPED,
            OrderStatus.DELIVERED
    );

    private final OrderRepository orderRepository;

    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        BigDecimal totalRevenue = orderRepository.calculateTotalRevenue(PAID_STATUSES);

        Long totalItemsSold = orderRepository.countTotalItemsSold(PAID_STATUSES);

        Long totalOrders = orderRepository.count();

        List<MonthlyRevenueResponse> monthlyRevenue =
                orderRepository.findMonthlyRevenue(PAID_STATUSES);

        List<TopProductResponse> topProducts =
                orderRepository.findTopProducts(PAID_STATUSES, PageRequest.of(0, 3));

        return DashboardStatsResponse.builder()
                .totalRevenue(totalRevenue)
                .totalItemsSold(totalItemsSold)
                .totalOrders(totalOrders)
                .monthlyRevenue(monthlyRevenue)
                .topProducts(topProducts)
                .build();
    }
}
