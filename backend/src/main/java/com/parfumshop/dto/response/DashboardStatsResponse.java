package com.parfumshop.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private BigDecimal totalRevenue;
    private Long totalItemsSold;
    private Long totalOrders;
    private List<MonthlyRevenueResponse> monthlyRevenue;
    private List<TopProductResponse> topProducts;
}
