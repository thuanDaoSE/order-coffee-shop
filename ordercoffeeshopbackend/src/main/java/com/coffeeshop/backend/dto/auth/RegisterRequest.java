package com.coffeeshop.backend.dto.auth;

import com.coffeeshop.backend.enums.UserRole;

import lombok.Data;

@Data
public class RegisterRequest {
    private String email;
    private String fullname;
    private String phone;
    private String password;
}
