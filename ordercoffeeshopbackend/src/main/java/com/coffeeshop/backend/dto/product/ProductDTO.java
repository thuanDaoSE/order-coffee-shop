package com.coffeeshop.backend.dto.product;

import java.math.BigDecimal;
import java.util.List;

import lombok.Data;

@Data
public class ProductDTO {
    private Long id;
    private String name;
    private String description;
    private String imageUrl;
    private List<ProductVariantDTO> variants;
    private Boolean isActive;
}
