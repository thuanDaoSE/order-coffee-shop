package com.coffeeshop.backend.dto.address;

import lombok.Data;

@Data
public class VietMapBoundaryDTO {
    /**
     * Type of boundary:
     * 0 = city (Thành Phố)
     * 1 = district (Quận/Huyện)
     * 2 = ward (Phường/Xã)
     */
    private Integer type;
    private Integer id;
    private String name;
    private String prefix;
    private String fullName;
}
