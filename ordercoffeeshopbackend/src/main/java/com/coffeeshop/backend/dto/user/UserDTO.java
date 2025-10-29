package com.coffeeshop.backend.dto;

import com.coffeeshop.backend.enums.UserRole;
import lombok.Data;

@Data
public class UserDTO {
    private Long id;
    private String email;
    private String fullname;
    private String phone;
    private UserRole role;
}
