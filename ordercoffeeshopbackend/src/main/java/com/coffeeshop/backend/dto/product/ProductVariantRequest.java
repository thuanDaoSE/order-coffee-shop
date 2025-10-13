package com.coffeeshop.backend.dto.product;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductVariantRequest {
    private String sku;
    private String size;
    private BigDecimal price;
    private Integer stockQuantity;
    private Boolean isActive;
}
