package com.coffeeshop.backend.service;

import com.coffeeshop.backend.dto.order.CreateOrderRequest;
import com.coffeeshop.backend.dto.order.OrderResponse;

import com.coffeeshop.backend.dto.voucher.VoucherValidationRequest;
import com.coffeeshop.backend.dto.voucher.VoucherValidationResponse;


public interface OrderService {
    OrderResponse createOrder(CreateOrderRequest request, String userEmail);


    VoucherValidationResponse validateVoucher(VoucherValidationRequest request);
}