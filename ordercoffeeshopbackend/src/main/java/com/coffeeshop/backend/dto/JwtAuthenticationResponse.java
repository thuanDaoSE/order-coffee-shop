package com.coffeeshop.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JwtAuthenticationResponse {
    private String token;
    private String tokenType = "Bearer";
    private String username;
    private String role;

    public JwtAuthenticationResponse(String token, String username, String role) {
        this.token = token;
        this.username = username;
        this.role = role;
    }
}
