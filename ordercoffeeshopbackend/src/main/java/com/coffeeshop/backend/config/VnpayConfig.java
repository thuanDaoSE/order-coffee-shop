package com.coffeeshop.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import lombok.Data;

@Configuration
@Data
public class VnpayConfig {
    @Value("${vnpay.tmn-code}")
    private String vnp_TmnCode;
    
    @Value("${vnpay.hash-secret}")
    private String vnp_HashSecret;
    
    @Value("${vnpay.url}")
    private String vnp_Url;
    
    @Value("${vnpay.return-url}")
    private String vnp_ReturnUrl;
    
    @Value("${vnpay.api-url}")
    private String vnp_ApiUrl;
    
    @Value("${vnpay.version}")
    private String vnp_Version;
    
    @Value("${vnpay.command}")
    private String vnp_Command;
    
    @Value("${vnpay.order-type}")
    private String vnp_OrderType;


}