package com.coffeeshop.backend.dto.voucher;

import com.coffeeshop.backend.enums.DiscountType;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class VoucherValidationResponse {
    private String code;
    private DiscountType discountType;
    private BigDecimal discountValue;
}
