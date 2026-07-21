package com.parfumshop.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderItemRequest {

    @NotNull(message = "Product ID must not be null")
    private Long productId;

    @Positive(message = "Quantity must be at least 1")
    private Integer quantity;
}
