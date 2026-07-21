package com.parfumshop.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Projection DTO used directly in JPQL constructor expression.
 * Maps to monthly aggregated revenue data from the Order table.
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyRevenueResponse {
    private Integer year;
    private Integer month;
    private BigDecimal revenue;
}
