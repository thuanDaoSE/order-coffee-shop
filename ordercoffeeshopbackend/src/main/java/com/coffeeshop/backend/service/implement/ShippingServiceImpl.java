package com.coffeeshop.backend.service.implement;

import com.coffeeshop.backend.service.ShippingService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class ShippingServiceImpl implements ShippingService {

    @Value("${shipping.rate-per-km}")
    private double ratePerKm;

    @Value("${shipping.first-km-rate}")
    private double firstKmRate;

    @Value("${shipping.shop.latitude}")
    private double shopLatitude;

    @Value("${shipping.shop.longitude}")
    private double shopLongitude;

    private static final double EARTH_RADIUS = 6371; // In kilometers


//...

    @Override
    public BigDecimal calculateShippingFee(double latitude, double longitude) {
        double distance = calculateDistance(shopLatitude, shopLongitude, latitude, longitude);
        double fee;
        if (distance <= 1) {
            fee = firstKmRate;
        } else {
            fee = firstKmRate + (distance - 1) * ratePerKm;
        }
        return BigDecimal.valueOf(Math.floor(fee / 100) * 100);
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        lat1 = Math.toRadians(lat1);
        lat2 = Math.toRadians(lat2);

        double a = Math.pow(Math.sin(dLat / 2), 2) + Math.pow(Math.sin(dLon / 2), 2) * Math.cos(lat1) * Math.cos(lat2);
        double c = 2 * Math.asin(Math.sqrt(a));
        return EARTH_RADIUS * c;
    }
}
