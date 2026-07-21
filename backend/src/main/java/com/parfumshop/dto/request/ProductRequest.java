package com.parfumshop.dto.request;

import jakarta.validation.constraints.NotBlank;
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

    @Positive(message = "Price must be a positive value")
    private BigDecimal price;

    @PositiveOrZero(message = "Stock quantity must be zero or positive")
    private Integer stockQuantity;

    private String imageUrl;
}
