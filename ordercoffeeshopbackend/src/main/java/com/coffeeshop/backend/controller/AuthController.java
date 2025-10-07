package com.coffeeshop.backend.controller;

import com.coffeeshop.backend.dto.ApiResponse;
import com.coffeeshop.backend.dto.SignUpRequest;
import com.coffeeshop.backend.entity.User;
import com.coffeeshop.backend.exception.UserAlreadyExistsException;
import com.coffeeshop.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
@Slf4j
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse> registerUser(@Valid @RequestBody SignUpRequest signUpRequest, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            StringBuilder errorMessage = new StringBuilder("Validation failed: ");
            bindingResult.getFieldErrors().forEach(error -> 
                errorMessage.append(error.getField())
                    .append(": ")
                    .append(error.getDefaultMessage())
                    .append("; ")
            );
            
            log.error("Validation errors: {}", errorMessage);
            return ResponseEntity.badRequest().body(
                ApiResponse.error(errorMessage.toString())
            );
        }
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
