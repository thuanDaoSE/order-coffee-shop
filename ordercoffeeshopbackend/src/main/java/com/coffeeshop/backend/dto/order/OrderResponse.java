package com.coffeeshop.backend.dto.order;

import com.coffeeshop.backend.dto.user.UserSummary;
import com.coffeeshop.backend.enums.OrderStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderResponse {
    private Long id;
    private LocalDateTime orderDate;
    private OrderStatus status;
    private BigDecimal totalPrice;
    private List<OrderItemResponse> orderDetails;
    private String deliveryMethod;
    private UserSummary user;
}