package com.coffeeshop.backend.service.implement;

import com.coffeeshop.backend.dto.order.CreateOrderRequest;
import com.coffeeshop.backend.dto.order.OrderItemRequest;
import com.coffeeshop.backend.dto.order.OrderResponse;
import com.coffeeshop.backend.entity.*;
import com.coffeeshop.backend.enums.DiscountType;
import com.coffeeshop.backend.enums.OrderStatus;
import com.coffeeshop.backend.enums.PaymentMethod;
import com.coffeeshop.backend.enums.PaymentStatus;
import com.coffeeshop.backend.exception.ResourceNotFoundException;
import com.coffeeshop.backend.mapper.OrderMapper;
import com.coffeeshop.backend.repository.OrderRepository;
import com.coffeeshop.backend.repository.ProductVariantRepository;
import com.coffeeshop.backend.repository.UserRepository;
import com.coffeeshop.backend.repository.VoucherRepository;
import com.coffeeshop.backend.dto.voucher.VoucherValidationRequest;
import com.coffeeshop.backend.dto.voucher.VoucherValidationResponse;
import com.coffeeshop.backend.service.OrderService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductVariantRepository productVariantRepository;
    private final VoucherRepository voucherRepository;
    private final OrderMapper orderMapper;
    private final SimpMessagingTemplate simpMessagingTemplate;

    @Override
    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request, String userEmail) {
        // 1. Find the user
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        // 2. Create a new Order
        Order order = new Order();
        order.setUser(user);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus(OrderStatus.PENDING);
        order.setOrderDetails(new ArrayList<>());

        // 3. Process order items and calculate total price
        BigDecimal totalPrice = BigDecimal.ZERO;
        for (OrderItemRequest itemRequest : request.getItems()) {
            ProductVariant variant = productVariantRepository.findById(itemRequest.getProductVariantId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "ProductVariant not found with id: " + itemRequest.getProductVariantId()));

            if (variant.getStockQuantity() < itemRequest.getQuantity()) {
                throw new RuntimeException(
                        "Not enough stock for product: " + variant.getProduct().getName() + " - " + variant.getSize());
            }

            OrderDetail detail = new OrderDetail();
            detail.setOrder(order);
            detail.setProductVariant(variant);
            detail.setQuantity(itemRequest.getQuantity());
            detail.setUnitPrice(variant.getPrice()); // Use price from the database

            order.getOrderDetails().add(detail);

            totalPrice = totalPrice.add(variant.getPrice().multiply(new BigDecimal(itemRequest.getQuantity())));

            // Decrease stock
            variant.setStockQuantity(variant.getStockQuantity() - itemRequest.getQuantity());
        }

        // 4. Handle voucher (if any)
        if (request.getCouponCode() != null && !request.getCouponCode().isEmpty()) {
            Voucher voucher = voucherRepository.findByCode(request.getCouponCode())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Voucher not found with code: " + request.getCouponCode()));
            // Basic validation, more can be added (e.g., expiry date, usage limits)
            if (voucher.getDiscountType() == DiscountType.PERCENT) {
                BigDecimal discount = totalPrice.multiply(voucher.getDiscountValue().divide(new BigDecimal(100)));
                totalPrice = totalPrice.subtract(discount);
            } else if (voucher.getDiscountType() == DiscountType.AMOUNT) {
                totalPrice = totalPrice.subtract(voucher.getDiscountValue());
            }
            order.setVoucher(voucher);
        }

        if (totalPrice.compareTo(BigDecimal.ZERO) < 0) {
            totalPrice = BigDecimal.ZERO;
        }

        order.setTotalPrice(totalPrice);

        // 5. Create and associate Payment
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setAmount(totalPrice);
        payment.setPaymentMethod(PaymentMethod.VNPAY); // Default or from request
        payment.setStatus(PaymentStatus.PENDING);
        order.setPayment(payment);

        // 6. Save the order
        Order savedOrder = orderRepository.save(order);

        // 7. Send notification
        simpMessagingTemplate.convertAndSend("/topic/orders", orderMapper.toOrderDTO(savedOrder));

        // 8. Map to response DTO
        return orderMapper.toOrderResponse(savedOrder);
    }

    @Override
    public VoucherValidationResponse validateVoucher(VoucherValidationRequest request) {
        Voucher voucher = voucherRepository.findByCode(request.getCode())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid voucher code: " + request.getCode()));

        if (voucher.getEndDate().isBefore(java.time.LocalDate.now())) {
            throw new ResourceNotFoundException("This voucher has expired.");
        }

        return orderMapper.toVoucherValidationResponse(voucher);
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        order.setStatus(status);
        Order updatedOrder = orderRepository.save(order);

        // Broadcast the status update
        simpMessagingTemplate.convertAndSend("/topic/orders", orderMapper.toOrderDTO(updatedOrder));

        return orderMapper.toOrderResponse(updatedOrder);
    }

    public boolean isOwnerOfOrder(Long orderId, String username) {
        return orderRepository.findById(orderId)
                .map(order -> order.getUser().getEmail().equals(username))
                .orElse(false);
    }

    @Override
    public List<OrderResponse> getOrdersByUserId(String username) {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + username));

        List<Order> orders = orderRepository.findAllByUserId(user.getId());

        return orders.stream()
                .map(orderMapper::toOrderResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderResponse> getAllOrders() {
        List<Order> orders = orderRepository.findAll();
        return orders.stream()
                .map(orderMapper::toOrderResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void cancelOrder(Long orderId, String username) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        // Verify ownership
        if (!order.getUser().getEmail().equals(username)) {
            throw new AccessDeniedException("You are not authorized to cancel this order.");
        }

        // Check if order is in a cancellable state
        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.PAID) {
            throw new IllegalStateException("Order cannot be cancelled once it is being prepared.");
        }

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);

        // Broadcast the status update
        simpMessagingTemplate.convertAndSend("/topic/orders", orderMapper.toOrderDTO(order));
    }
}
