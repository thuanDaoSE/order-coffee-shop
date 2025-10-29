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
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(jwtExpiration / 1000);
        cookie.setAttribute("SameSite", "Lax");

        Cookie refreshTokenCookie = new Cookie("refreshToken", loginResponse.getRefreshToken());
        refreshTokenCookie.setHttpOnly(true);
        refreshTokenCookie.setSecure(false);
        refreshTokenCookie.setPath("/");
        refreshTokenCookie.setMaxAge(604800); // 7 days
        refreshTokenCookie.setAttribute("SameSite", "Lax");

        response.addCookie(cookie);
        response.addCookie(refreshTokenCookie);

        loginResponse.setToken(null);
        loginResponse.setRefreshToken(null);

        return new ResponseEntity<>(loginResponse, HttpStatus.OK);
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refreshToken(@CookieValue(name = "refreshToken") String refreshToken, HttpServletResponse response) {
        LoginResponse loginResponse = authService.refreshToken(refreshToken);

        Cookie cookie = new Cookie("jwt", loginResponse.getToken());
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(jwtExpiration / 1000);
        cookie.setAttribute("SameSite", "Lax");

        Cookie newRefreshTokenCookie = new Cookie("refreshToken", loginResponse.getRefreshToken());
        newRefreshTokenCookie.setHttpOnly(true);
        newRefreshTokenCookie.setSecure(false);
        newRefreshTokenCookie.setPath("/");
        newRefreshTokenCookie.setMaxAge(604800); // 7 days
        newRefreshTokenCookie.setAttribute("SameSite", "Lax");

        response.addCookie(cookie);
        response.addCookie(newRefreshTokenCookie);

        loginResponse.setToken(null);
        loginResponse.setRefreshToken(null);

        return new ResponseEntity<>(loginResponse, HttpStatus.OK);
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        UserProfileResponse userProfile = authService.getProfile(userDetails.getUsername());
        return ResponseEntity.ok(userProfile);
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
