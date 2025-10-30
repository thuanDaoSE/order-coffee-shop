package com.coffeeshop.backend.dto;

import java.math.BigDecimal;

public class ShippingInfoDTO {
    private BigDecimal shippingFee;
    private double distance;

    public ShippingInfoDTO(BigDecimal shippingFee, double distance) {
        this.shippingFee = shippingFee;
        this.distance = distance;
    }

    public BigDecimal getShippingFee() {
        return shippingFee;
    }

    public void setShippingFee(BigDecimal shippingFee) {
        this.shippingFee = shippingFee;
    }

    public double getDistance() {
        return distance;
    }

    public void setDistance(double distance) {
        this.distance = distance;
    }
}
