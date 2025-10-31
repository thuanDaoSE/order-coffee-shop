package com.coffeeshop.backend.service;

import com.coffeeshop.backend.dto.payment.PaymentInitiationRequest;
import com.coffeeshop.backend.entity.Order;
import com.coffeeshop.backend.entity.Payment;
import com.coffeeshop.backend.enums.OrderStatus;
import com.coffeeshop.backend.enums.PaymentStatus;
import com.coffeeshop.backend.repository.OrderRepository;
import com.coffeeshop.backend.repository.PaymentRepository;
import com.coffeeshop.backend.utils.VnpayUtils;
import com.coffeeshop.backend.mapper.OrderMapper;

import io.swagger.v3.oas.annotations.parameters.RequestBody;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.http.ResponseEntity;
import com.coffeeshop.backend.exception.PaymentExceptionHanlder;
import java.io.UnsupportedEncodingException;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class VnpayService {
    private static final Logger logger = LoggerFactory.getLogger(VnpayService.class);
    
    // VNPAY Response Codes
    private static final String VNP_SUCCESS_CODE = "00";
    private static final String VNP_ORDER_NOT_FOUND_CODE = "01";
    private static final String VNP_ORDER_ALREADY_CONFIRMED_CODE = "02";
    private static final String VNP_INVALID_AMOUNT_CODE = "04";
    private static final String VNP_INVALID_SIGNATURE_CODE = "97";
    
    // Response Messages
    private static final String CONFIRM_SUCCESS_MESSAGE = "Confirm Success";
    
    private final VnpayUtils vnpayUtils;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final SimpMessagingTemplate simpMessagingTemplate;
    private final OrderMapper orderMapper;

    
    public ResponseEntity<String> createVnpayPaymentUrl(@RequestBody
        PaymentInitiationRequest paymentInitiationRequest, String clientIp) 
                                 
                                 {
        try {
            String url = vnpayUtils.createVnpayPaymentUrl(paymentInitiationRequest, clientIp);
            logger.info("Created VNPAY URL for Order ID {}: {}", paymentInitiationRequest.getOrderId(), url);
            return ResponseEntity.ok(url);
        } catch (UnsupportedEncodingException e) {
            logger.error("Error creating VNPAY payment URL", e);
            throw new PaymentExceptionHanlder("Error creating VNPAY payment URL");
        }
    }

    @Transactional
    public Map<String, String> handleVnpayCallback(Map<String, String> vnpayParams) {
        Map<String, String> result = new HashMap<>();

        // 1. Validate checksum
        if (!vnpayUtils.isSignatureValid(vnpayParams)) {
            logger.warn("VNPAY callback checksum failed for TxnRef: {}", vnpayParams.get("vnp_TxnRef"));
            result.put("RspCode", VNP_INVALID_SIGNATURE_CODE);
            result.put("Message", "Invalid Checksum");
            return result;
        }

        // 2. Find Order by vnp_TxnRef (which is our order ID)
        String txnRef = vnpayParams.get("vnp_TxnRef");
        String sanitizedOrderId = txnRef != null ? txnRef.replaceAll("[^0-9]", "") : "";
        if (sanitizedOrderId.isEmpty()) {
            logger.warn("VNPAY callback: TxnRef is empty or invalid after sanitization.");
            result.put("RspCode", VNP_ORDER_NOT_FOUND_CODE);
            result.put("Message", "Order not found");
            return result;
        }
        Long orderId = Long.parseLong(sanitizedOrderId);
        Order order = orderRepository.findById(orderId).orElse(null);

        if (order == null) {
            logger.warn("VNPAY callback: Order not found for TxnRef: {}", orderId);
            result.put("RspCode", VNP_ORDER_NOT_FOUND_CODE);
            result.put("Message", "Order not found");
            return result;
        }

        // 3. Check if the order has already been processed
        if (order.getStatus() == OrderStatus.PAID || order.getStatus() == OrderStatus.CANCELLED) {
            logger.info("VNPAY callback: Order {} already processed with status {}", orderId, order.getStatus());
            result.put("RspCode", VNP_ORDER_ALREADY_CONFIRMED_CODE);
            result.put("Message", "Order already confirmed");
            return result;
        }

        // 4. Check amount
        // VNPAY amount is in pennies (100 = 1 VND), so we divide by 100.
        BigDecimal vnpayAmount = new BigDecimal(vnpayParams.get("vnp_Amount")).divide(new BigDecimal(100));
        if (order.getTotalPrice().compareTo(vnpayAmount) != 0) {
            logger.error("VNPAY callback: Invalid amount for order {}. Expected: {}, Actual: {}", orderId, order.getTotalPrice(), vnpayAmount);
            // Even with invalid amount, VNPAY expects a success response if signature is valid.
            // We should handle this internally, maybe by flagging the order for review.
            // For now, we will cancel it as a security measure.
            handleFailedTransaction(order, "Invalid amount");
            result.put("RspCode", VNP_INVALID_AMOUNT_CODE);
            result.put("Message", "Invalid amount");
            return result;
        }

        // 5. Check transaction status from VNPAY
        if (VNP_SUCCESS_CODE.equals(vnpayParams.get("vnp_ResponseCode"))) {
            handleSuccessfulTransaction(order);
            logger.info("VNPAY payment successful for order {}", orderId);
            result.put("RspCode", VNP_SUCCESS_CODE);
            result.put("Message", CONFIRM_SUCCESS_MESSAGE);
        } else {
            String failureReason = "VNPAY response code: " + vnpayParams.get("vnp_ResponseCode");
            handleFailedTransaction(order, failureReason);
            logger.warn("VNPAY payment failed for order {}. Reason: {}", orderId, failureReason);
            
            // For the response to VNPAY, we still need to confirm we received the IPN.
            // According to docs, if signature is valid, we should return 00.
            result.put("RspCode", VNP_SUCCESS_CODE);
            result.put("Message", CONFIRM_SUCCESS_MESSAGE);
        }

        return result;
    }

    private void handleSuccessfulTransaction(Order order) {
        order.setStatus(OrderStatus.PAID);
        Payment payment = order.getPayment();
        if (payment != null) {
            payment.setStatus(PaymentStatus.SUCCESS);
            paymentRepository.save(payment);
        }
        Order updatedOrder = orderRepository.save(order);
        simpMessagingTemplate.convertAndSend("/topic/orders", orderMapper.toOrderDTO(updatedOrder));
    }

    private void handleFailedTransaction(Order order, String reason) {
        order.setStatus(OrderStatus.CANCELLED); // Or keep it PENDING based on business logic
        Payment payment = order.getPayment();
        if (payment != null) {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
        }
        orderRepository.save(order);
    }

    /**
     * Checks the status of an order to be returned to the client.
     * @param orderId The ID of the order.
     * @return A map containing the status information.
     */
    public Map<String, Object> getPaymentStatus(String orderId) {
        Map<String, Object> result = new HashMap<>();
        try {
            // Sanitize the orderId to remove any non-numeric characters before parsing.
            String sanitizedOrderId = orderId.replaceAll("[^0-9]", "");
            Long id = Long.parseLong(sanitizedOrderId);
            Order order = orderRepository.findById(id).orElse(null);

            if (order == null) {
                result.put("success", false);
                result.put("message", "Order not found.");
                return result;
            }

            result.put("success", true);
            result.put("orderId", order.getId());
            result.put("status", order.getStatus()); // e.g., PAID, PENDING, CANCELLED
            logger.info("Returning payment status for Order ID {}: {}", id, order.getStatus());
            return result;
        } catch (NumberFormatException e) {
            logger.error("Invalid Order ID format for: {}", orderId, e);
            result.put("success", false);
            result.put("message", "Invalid Order ID format.");
            return result;
        }
    }
}