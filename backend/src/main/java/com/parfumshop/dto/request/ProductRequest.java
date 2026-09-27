package com.parfumshop.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ProductRequest {

    @NotBlank(message = "Product name must not be blank")
    private String name;

    @NotBlank(message = "Brand must not be blank")
    private String brand;

    private String description;

    @NotBlank(message = "Scent note must not be blank")
    private String scentNote;

    @NotNull(message = "Price must not be null")
    @Positive(message = "Price must be a positive value")
    private BigDecimal price;

    @NotNull(message = "Stock quantity must not be null")
    @PositiveOrZero(message = "Stock quantity must be zero or positive")
    private Integer stockQuantity;

    private String imageUrl;
}
