package com.coffeeshop.backend.dto.auth;

import com.coffeeshop.backend.entity.User;

import lombok.Data;

@Data
public class LoginResponse {
    private String token;
    private String type = "Bearer";
    private User user;
}
