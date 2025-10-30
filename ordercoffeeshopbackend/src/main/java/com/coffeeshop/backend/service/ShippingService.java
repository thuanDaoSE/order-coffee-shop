package com.coffeeshop.backend.service;

import java.math.BigDecimal;

public interface ShippingService {
    BigDecimal calculateShippingFee(double latitude, double longitude);
}
