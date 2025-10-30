package com.coffeeshop.backend.controller;

import com.coffeeshop.backend.service.ShippingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/shipping")
@RequiredArgsConstructor
public class ShippingController {

    private final ShippingService shippingService;

    @PostMapping("/calculate")
    public ResponseEntity<Map<String, Double>> calculateShippingFee(@RequestBody Map<String, Double> body) {
        double latitude = body.get("latitude");
        double longitude = body.get("longitude");
        BigDecimal shippingFee = shippingService.calculateShippingFee(latitude, longitude);
        return ResponseEntity.ok(Map.of("shippingFee", shippingFee.doubleValue()));
    }
}
