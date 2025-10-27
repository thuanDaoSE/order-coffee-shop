package com.coffeeshop.backend.controller;

import com.coffeeshop.backend.dto.order.OrderResponse;
import com.coffeeshop.backend.enums.OrderStatus;
import com.coffeeshop.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dev")
@RequiredArgsConstructor
public class DevController {

    private final OrderService orderService;

    @PutMapping("/orders/{orderId}/mark-delivered")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<OrderResponse> markOrderAsDelivered(@PathVariable Long orderId) {
        OrderResponse updatedOrder = orderService.updateOrderStatus(orderId, OrderStatus.DELIVERED);
        return ResponseEntity.ok(updatedOrder);
    }
}
