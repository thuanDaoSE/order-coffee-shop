package com.coffeeshop.backend.controller;

import com.coffeeshop.backend.dto.payment.PaymentInitiationRequest;
import com.coffeeshop.backend.service.VnpayService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/payment")
public class PaymentController {

    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);

    @Autowired
    private VnpayService vnpayService;

    @PostMapping("/create-payment")
    public ResponseEntity<String> createPayment(@RequestBody PaymentInitiationRequest initiationRequest, HttpServletRequest request) {
        String clientIp = getClientIp(request);
        logger.info("Creating VNPAY payment request for Order ID: {} with Amount: {}", initiationRequest.getOrderId(), initiationRequest.getAmount());
        // The service call now handles the creation and logging of the URL
        return vnpayService.createVnpayPaymentUrl(initiationRequest, clientIp);
    }

    private String getClientIp(HttpServletRequest request) {
        String remoteAddr = request.getHeader("X-FORWARDED-FOR");
        if (remoteAddr == null || remoteAddr.isEmpty()) {
            remoteAddr = request.getRemoteAddr();
        }
        return remoteAddr;
    }

    @GetMapping("/callback")
    public ResponseEntity<?> handlePaymentCallback(@RequestParam Map<String, String> allParams) {
        logger.info("====== VNPAY IPN CALLED ======");
        logger.info("Params: {}", allParams);
        logger.info("==============================");
        return ResponseEntity.ok(vnpayService.handleVnpayCallback(allParams));
    }

    @GetMapping("/status/{orderId}")
    @PreAuthorize("@orderServiceImpl.isOwnerOfOrder(#orderId, principal.username)")
    public ResponseEntity<?> getPaymentStatus(@PathVariable String orderId) {
        logger.info("Checking payment status for Order ID: {}", orderId);
        return ResponseEntity.ok(vnpayService.getPaymentStatus(orderId));
    }
}
