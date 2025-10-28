package com.coffeeshop.backend.controller;

import com.coffeeshop.backend.dto.UserDTO;
import com.coffeeshop.backend.entity.User;
import com.coffeeshop.backend.enums.UserRole;
import com.coffeeshop.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

@GetMapping("")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Page<UserDTO>> getAllUsers(@RequestParam(required = false, defaultValue = "") String search, Pageable pageable) {
        Page<User> users = userService.getAllUsers(search, pageable);
        return ResponseEntity.ok(users.map(this::convertToDto));
    }

    @PutMapping("/{userId}/role")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<UserDTO> updateUserRole(@PathVariable Long userId, @RequestBody Map<String, String> body) {
        UserRole role = UserRole.valueOf(body.get("role"));
        User updatedUser = userService.updateUserRole(userId, role);
        return ResponseEntity.ok(convertToDto(updatedUser));
    }

    private UserDTO convertToDto(User user) {
        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getId());
        userDTO.setEmail(user.getEmail());
        userDTO.setFullname(user.getFullname());
        userDTO.setPhone(user.getPhone());
        userDTO.setRole(user.getRole());
        return userDTO;
    }
}
