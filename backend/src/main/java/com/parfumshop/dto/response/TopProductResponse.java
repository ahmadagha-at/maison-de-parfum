package com.parfumshop.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Projection DTO used directly in JPQL constructor expression.
 * Represents the top-selling products aggregated from order items.
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class TopProductResponse {
    private Long productId;
    private String productName;
    private String brand;
    private Long totalQuantitySold;
    private BigDecimal totalRevenue;
}
