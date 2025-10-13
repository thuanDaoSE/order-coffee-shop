package com.coffeeshop.backend.dto.order;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class OrderResponse {
    private Long id;
    private BigDecimal total;
    private String status;
}