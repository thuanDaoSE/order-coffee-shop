package com.coffeeshop.backend.controller;

import com.coffeeshop.backend.dto.ApiResponse;
import com.coffeeshop.backend.dto.SignUpRequest;
import com.coffeeshop.backend.entity.User;
import com.coffeeshop.backend.exception.UserAlreadyExistsException;
import com.coffeeshop.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse> registerUser(@Valid @RequestBody SignUpRequest signUpRequest) {
        try {
            User user = userService.registerUser(signUpRequest);
            return ResponseEntity.ok(
                ApiResponse.success("User registered successfully", user.getUsername())
            );
        } catch (UserAlreadyExistsException e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error(e.getMessage())
            );
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                ApiResponse.error("An error occurred while processing your request")
            );
        }
    }
}
