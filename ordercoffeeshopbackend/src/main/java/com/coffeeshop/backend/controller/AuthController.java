package com.coffeeshop.backend.controller;

import com.coffeeshop.backend.config.JwtTokenProvider;
import com.coffeeshop.backend.dto.*;
import com.coffeeshop.backend.entity.User;
import com.coffeeshop.backend.exception.UserAlreadyExistsException;
import com.coffeeshop.backend.exception.AuthenticationException;
import com.coffeeshop.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    public AuthController(UserService userService, 
                         AuthenticationManager authenticationManager, 
                         JwtTokenProvider tokenProvider) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
    }

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

    @PostMapping("/login")
    public ResponseEntity<ApiResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Validation failed: Username and password are required")
            );
        }

        try {
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getUsername(),
                    loginRequest.getPassword()
                )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Generate JWT token
            String jwt = tokenProvider.generateToken(authentication);
            
            // Get user details
            User user = userService.authenticateUser(
                loginRequest.getUsername(),
                loginRequest.getPassword()
            );

            // Create response
            JwtAuthenticationResponse response = new JwtAuthenticationResponse(
                jwt,
                user.getUsername(),
                user.getRole().name()
            );

            return ResponseEntity.ok(ApiResponse.success("Login successful", response));
            
        } catch (org.springframework.security.core.AuthenticationException e) {
            // This will catch BadCredentialsException and other Spring Security authentication exceptions
            return ResponseEntity.status(401).body(
                ApiResponse.error("Invalid username or password")
            );
        } catch (AuthenticationException e) {
            // This catches our custom AuthenticationException
            return ResponseEntity.status(401).body(
                ApiResponse.error(e.getMessage())
            );
        } catch (Exception e) {
            log.error("Login error: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(
                ApiResponse.error("An error occurred during login")
            );
        }
    }
}
