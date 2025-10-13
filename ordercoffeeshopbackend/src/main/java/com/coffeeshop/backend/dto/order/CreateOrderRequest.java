package com.coffeeshop.backend.dto.order;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class CreateOrderRequest {
    private List<OrderItemRequest> items;
    private String couponCode;
    private String deliveryMethod;
    private BigDecimal total;
    private BigDecimal subtotal;
    private BigDecimal discount;
    private BigDecimal vat;
    private BigDecimal shipping;
}