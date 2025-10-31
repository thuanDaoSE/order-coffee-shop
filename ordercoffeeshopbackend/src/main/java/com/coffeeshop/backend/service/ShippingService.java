package com.coffeeshop.backend.service;


import com.coffeeshop.backend.dto.ShippingInfoDTO;

public interface ShippingService {
    ShippingInfoDTO calculateShippingFee(double latitude, double longitude);
}
