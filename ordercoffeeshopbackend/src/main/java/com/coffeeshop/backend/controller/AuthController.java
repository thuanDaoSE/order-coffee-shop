package com.coffeeshop.backend.controller;

import com.coffeeshop.backend.dto.auth.*;
import com.coffeeshop.backend.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Value("${spring.security.jwt.expiration}")
    private int jwtExpiration;

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@RequestBody RegisterRequest registerRequest) {
        RegisterResponse registerResponse = authService.registerNewUser(registerRequest);
        return new ResponseEntity<>(registerResponse, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest, HttpServletResponse response) {
        LoginResponse loginResponse = authService.login(loginRequest);

        Cookie cookie = new Cookie("jwt", loginResponse.getToken());
        cookie.setHttpOnly(true); // Prevents JavaScript access
        cookie.setSecure(true); // Allow HTTPs for production
        // cookie.setSecure(false); // Allow HTTP for development
        cookie.setPath("/"); // Cookie is available for all paths
        cookie.setMaxAge(jwtExpiration / 1000); // Cookie expiration same as JWT
        // cookie.setAttribute("SameSite", "Lax"); // More permissive for development
        cookie.setAttribute("SameSite", "None"); // More permissive for production

        // Set additional security headers
        response.setHeader("X-Content-Type-Options", "nosniff");
        response.setHeader("X-Frame-Options", "DENY");
        response.setHeader("X-XSS-Protection", "1; mode=block");

        response.addCookie(cookie);

        // Don't send the token in the response body for security
        loginResponse.setToken(null);

        return new ResponseEntity<>(loginResponse, HttpStatus.OK);
    }

    @GetMapping("/profile")
    public ResponseEntity<UserDetails> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(userDetails);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("jwt", "");
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge(0); // Immediately expire the cookie
        cookie.setAttribute("SameSite", "Lax");

        response.addCookie(cookie);
        response.setHeader("Clear-Site-Data", "\"cache\", \"cookies\"");

        return ResponseEntity.ok().build();
    }
}
