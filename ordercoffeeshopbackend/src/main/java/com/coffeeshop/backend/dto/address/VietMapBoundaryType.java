package com.coffeeshop.backend.dto.address;

/**
 * Enum for VietMap boundary types
 * 0 = CITY (Thành Phố)
 * 1 = DISTRICT (Quận/Huyện)
 * 2 = WARD (Phường/Xã)
 */
public enum VietMapBoundaryType {
    CITY(0, "Thành Phố"),
    DISTRICT(1, "Quận/Huyện"),
    WARD(2, "Phường/Xã");

    private final int value;
    private final String vietnameseName;

    VietMapBoundaryType(int value, String vietnameseName) {
        this.value = value;
        this.vietnameseName = vietnameseName;
    }

    public int getValue() {
        return value;
    }

    public String getVietnameseName() {
        return vietnameseName;
    }

    public static VietMapBoundaryType fromValue(int value) {
        for (VietMapBoundaryType type : VietMapBoundaryType.values()) {
            if (type.value == value) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown boundary type: " + value);
    }
}
