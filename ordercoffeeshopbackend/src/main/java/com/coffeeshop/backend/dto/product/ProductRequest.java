package com.coffeeshop.backend.dto.product;

import lombok.Data;
import java.util.List;

@Data
public class ProductRequest {
    private String name;
    private String description;
    private String imageUrl;
    private Long categoryId;
    private Boolean isActive;
    private List<ProductVariantRequest> variants;
}
