package com.coffeeshop.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SignUpRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Username must be a valid email address")
    @Size(max = 50, message = "Email must not exceed 50 characters")
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 100, message = "Password must be between 6 and 100 characters")
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\\S+$).{6,}$", 
            message = "Password must contain at least one digit, one lowercase, one uppercase, one special character and no whitespace")
    private String password;

    @NotBlank(message = "Role is required")
    @Pattern(regexp = "^(CUSTOMER|ADMIN|STAFF)$", message = "Invalid role. Must be CUSTOMER, ADMIN, or STAFF")
    private String role;
}
