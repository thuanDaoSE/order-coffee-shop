package com.coffeeshop.backend.controller;

import com.coffeeshop.backend.dto.ShippingInfoDTO;
import com.coffeeshop.backend.service.ShippingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/shipping")
@RequiredArgsConstructor
public class ShippingController {

    private final ShippingService shippingService;

    @PostMapping("/calculate")
    public ResponseEntity<Map<String, Object>> calculateShippingFee(@RequestBody Map<String, Double> body) {
        double latitude = body.get("latitude");
        double longitude = body.get("longitude");
        ShippingInfoDTO shippingInfo = shippingService.calculateShippingFee(latitude, longitude);
        return ResponseEntity.ok(Map.of("shippingFee", shippingInfo.getShippingFee().doubleValue(), "distance", shippingInfo.getDistance()));
    }
}
