package com.coffeeshop.backend.service;

import java.math.BigDecimal;

import com.coffeeshop.backend.dto.ShippingInfoDTO;

public interface ShippingService {
    ShippingInfoDTO calculateShippingFee(double latitude, double longitude);
}
