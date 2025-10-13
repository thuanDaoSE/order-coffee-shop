package com.coffeeshop.backend.controller;

import com.coffeeshop.backend.dto.payment.PaymentInitiationRequest;
import com.coffeeshop.backend.dto.payment.VnpayRequest;
import com.coffeeshop.backend.dto.payment.VnpayResponse;
import com.coffeeshop.backend.service.VnpayService;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;


@RestController
@RequestMapping("/api/v1/payment")
public class PaymentController {

    @Autowired
    private VnpayService vnpayService;

    @PostMapping("/create-payment")
    public ResponseEntity<String> createPayment(@RequestBody PaymentInitiationRequest initiationRequest, HttpServletRequest request) throws Exception {
        String clientIp = getClientIp(request);

        // Create and populate the VNPAY-specific request object
        VnpayRequest vnpayRequest = new VnpayRequest();
        vnpayRequest.setVnp_Amount(initiationRequest.getAmount());
        vnpayRequest.setVnp_OrderInfo(initiationRequest.getOrderInfo());
        // Assuming orderId from frontend should be mapped to vnp_TxnRef
        vnpayRequest.setVnp_TxnRef(initiationRequest.getOrderId()); 

        // The service call seems redundant, but we'll keep it as is.
        // It would be better if the service accepted the initiationRequest directly.
        return vnpayService.createVnpayPaymentUrl(initiationRequest, clientIp);
    }

    private String getClientIp(HttpServletRequest request) {
        String remoteAddr = "";
        if (request != null) {
            remoteAddr = request.getHeader("X-FORWARDED-FOR");
            if (remoteAddr == null || remoteAddr.isEmpty()) {
                remoteAddr = request.getRemoteAddr();
            }
        }
        return remoteAddr;
    }

    /**
     * Handles the Instant Payment Notification (IPN) from VNPAY.
     * This endpoint is called by VNPAY server to confirm the transaction status.
     *
     * @param vnpayResponse DTO containing all parameters sent by VNPAY.
     * @return A ResponseEntity with a JSON object confirming the status, as required by VNPAY.
     */
    @GetMapping("/callback")
    public ResponseEntity<?> handlePaymentCallback(@RequestParam Map<String, String> allParams) {
        // Log all parameters received from VNPAY for debugging. This is very important.
        System.out.println("====== VNPAY IPN CALLED ======");
        System.out.println("Params: " + allParams.toString());
        System.out.println("==============================");
        return ResponseEntity.ok(vnpayService.handleVnpayCallback(allParams));
    }

    /**
     * Endpoint for the client (frontend) to check the payment status of an order.
     * This is called from the payment result page after the user is redirected back from VNPAY.
     * It's secured to ensure only the order's owner can check its status.
     * @param orderId The ID of the order to check.
     * @return A ResponseEntity with the payment status.
     */
    @GetMapping("/status/{orderId}")
    @PreAuthorize("@orderServiceImpl.isOwnerOfOrder(#orderId, principal.username)")
    public ResponseEntity<?> getPaymentStatus(@PathVariable String orderId) {
        return ResponseEntity.ok(vnpayService.getPaymentStatus(orderId));
    }
}
