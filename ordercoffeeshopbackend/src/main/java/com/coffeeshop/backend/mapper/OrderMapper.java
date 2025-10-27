package com.coffeeshop.backend.mapper;

import com.coffeeshop.backend.dto.order.OrderItemResponse;
import com.coffeeshop.backend.dto.order.OrderResponse;
import com.coffeeshop.backend.dto.user.UserSummary;
import com.coffeeshop.backend.dto.voucher.VoucherValidationResponse;
import com.coffeeshop.backend.entity.Order;
import com.coffeeshop.backend.entity.OrderDetail;
import com.coffeeshop.backend.entity.User;
import com.coffeeshop.backend.entity.Voucher;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    OrderResponse toOrderResponse(Order order);

    @Mapping(source = "productVariant.id", target = "productVariantId")
    @Mapping(source = "productVariant.product.name", target = "productName")
    @Mapping(source = "productVariant.size", target = "size")
    OrderItemResponse toOrderItemResponse(OrderDetail orderDetail);

    UserSummary toUserSummary(User user);

    List<OrderItemResponse> toOrderItemResponseList(List<OrderDetail> orderDetails);

    VoucherValidationResponse toVoucherValidationResponse(Voucher voucher);

    OrderResponse toOrderDTO(Order order);
}
