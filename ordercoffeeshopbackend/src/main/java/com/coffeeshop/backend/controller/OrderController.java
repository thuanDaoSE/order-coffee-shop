package com.coffeeshop.backend.controller;

import com.coffeeshop.backend.dto.order.CreateOrderRequest;
import com.coffeeshop.backend.dto.order.OrderResponse;
import com.coffeeshop.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.coffeeshop.backend.dto.voucher.VoucherValidationRequest;
import com.coffeeshop.backend.dto.voucher.VoucherValidationResponse;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
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
    public ResponseEntity<List<OrderResponse>> getOrdersByUserId(@AuthenticationPrincipal UserDetails userDetails) {
        List<OrderResponse> orders = orderService.getOrdersByUserId(userDetails.getUsername());
        return ResponseEntity.ok(orders);
    }
}