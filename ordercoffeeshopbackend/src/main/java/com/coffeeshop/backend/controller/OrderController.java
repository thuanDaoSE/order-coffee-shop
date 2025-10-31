package com.coffeeshop.backend.controller;

import com.coffeeshop.backend.dto.order.UpdateStatusRequest;
import com.coffeeshop.backend.enums.OrderStatus;
import com.coffeeshop.backend.dto.order.CreateOrderRequest;
import com.coffeeshop.backend.dto.order.OrderResponse;
import com.coffeeshop.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.coffeeshop.backend.dto.voucher.VoucherValidationRequest;
import com.coffeeshop.backend.dto.voucher.VoucherValidationResponse;
import lombok.extern.slf4j.Slf4j;


import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;

@Slf4j
@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @PreAuthorize("hasAnyRole('CUSTOMER')")
    public ResponseEntity<OrderResponse> createOrder(@RequestBody CreateOrderRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        OrderResponse response = orderService.createOrder(request, userDetails.getUsername());
        log.info("Order created successfully");
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/validate-voucher")
    public ResponseEntity<VoucherValidationResponse> validateVoucher(@RequestBody VoucherValidationRequest request) {
        VoucherValidationResponse response = orderService.validateVoucher(request);
        log.info("Voucher validation successful");
        return ResponseEntity.ok(response);
    }




    @GetMapping("")
    public ResponseEntity<Page<OrderResponse>> getOrdersByUserId(@AuthenticationPrincipal UserDetails userDetails, @PageableDefault(sort = "orderDate", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<OrderResponse> orders = orderService.getOrdersByUserId(userDetails.getUsername(), pageable);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        List<OrderResponse> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    @PutMapping("/{orderId}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody UpdateStatusRequest statusRequest) {
        OrderStatus status = OrderStatus.valueOf(statusRequest.getStatus().toUpperCase());
        OrderResponse updatedOrder = orderService.updateOrderStatus(orderId, status);
        return ResponseEntity.ok(updatedOrder);
    }

    @PutMapping("/{orderId}/cancel")
    @PreAuthorize("hasAnyRole('CUSTOMER')")
    public ResponseEntity<?> cancelOrder(
            @PathVariable Long orderId,
            @AuthenticationPrincipal UserDetails userDetails) {
        orderService.cancelOrder(orderId, userDetails.getUsername());
        return ResponseEntity.ok().build();
    }
}