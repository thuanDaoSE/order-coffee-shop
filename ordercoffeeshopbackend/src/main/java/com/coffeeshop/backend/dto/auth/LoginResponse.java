package com.coffeeshop.backend.dto.auth;

import com.coffeeshop.backend.enums.UserRole;

import lombok.Data;

@Data
public class LoginResponse {
    private String id;
    private String email;
    private String fullname;
    private String phone;
    private UserRole role;
    
    private String token; // This will be set to null before sending the response
    private String refreshToken;
    
}