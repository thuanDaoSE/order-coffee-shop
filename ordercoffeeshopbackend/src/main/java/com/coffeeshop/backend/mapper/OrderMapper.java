package com.coffeeshop.backend.mapper;

import com.coffeeshop.backend.dto.order.OrderResponse;
import com.coffeeshop.backend.entity.Order;
import com.coffeeshop.backend.dto.voucher.VoucherValidationResponse;
import com.coffeeshop.backend.entity.Voucher;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    OrderMapper INSTANCE = Mappers.getMapper(OrderMapper.class);

    @Mapping(source = "id", target = "id")
    @Mapping(source = "totalPrice", target = "total")
    @Mapping(source = "status", target = "status")
    OrderResponse toOrderResponse(Order order);

    @Mapping(source = "code", target = "code")
    @Mapping(source = "discountType", target = "discountType")
    @Mapping(source = "discountValue", target = "discountValue")
    VoucherValidationResponse toVoucherValidationResponse(Voucher voucher);
}
