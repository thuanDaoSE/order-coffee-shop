package com.coffeeshop.backend.controller;

import com.coffeeshop.backend.dto.auth.*;
import com.coffeeshop.backend.service.AuthService;
import com.coffeeshop.backend.service.TokenBlacklistService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final TokenBlacklistService tokenBlacklistService;

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
        // cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setDomain("103.77.243.143");
        cookie.setMaxAge(jwtExpiration / 1000); // Thời gian sống của JWT
        cookie.setAttribute("SameSite", "Lax");

        Cookie refreshTokenCookie = new Cookie("refreshToken", loginResponse.getRefreshToken());
        refreshTokenCookie.setHttpOnly(true);
        // refreshTokenCookie.setSecure(true);
        refreshTokenCookie.setPath("/");
        refreshTokenCookie.setMaxAge(604800); // 7 days
        refreshTokenCookie.setAttribute("SameSite", "Lax");
        refreshTokenCookie.setDomain("103.77.243.143");
        response.addCookie(cookie);
        response.addCookie(refreshTokenCookie);

        loginResponse.setToken(null);
        loginResponse.setRefreshToken(null);

         // Add security headers
        response.setHeader("X-Content-Type-Options", "nosniff");
        response.setHeader("X-Frame-Options", "DENY");
        response.setHeader("X-XSS-Protection", "1; mode=block");

        return new ResponseEntity<>(loginResponse, HttpStatus.OK);
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refreshToken(@CookieValue(name = "refreshToken") String refreshToken,
            HttpServletResponse response) {
        LoginResponse loginResponse = authService.refreshToken(refreshToken);

        Cookie cookie = new Cookie("jwt", loginResponse.getToken());
        cookie.setHttpOnly(true); // Nên luôn là true để ngăn chặn XSS
        // cookie.setSecure(true);   // BẮT BUỘC là true trong môi trường production
        cookie.setPath("/");
        cookie.setDomain("103.77.243.143");
        cookie.setMaxAge(jwtExpiration / 1000);
        cookie.setAttribute("SameSite", "Lax");

        Cookie newRefreshTokenCookie = new Cookie("refreshToken", loginResponse.getRefreshToken());
        newRefreshTokenCookie.setHttpOnly(true); // Nên luôn là true để ngăn chặn XSS
        // newRefreshTokenCookie.setSecure(true);   // BẮT BUỘC là true trong môi trường production
        newRefreshTokenCookie.setPath("/");
        newRefreshTokenCookie.setDomain("103.77.243.143");
        newRefreshTokenCookie.setMaxAge(604800); // 7 days
        newRefreshTokenCookie.setAttribute("SameSite", "Lax");

        response.addCookie(cookie);
        response.addCookie(newRefreshTokenCookie);

        loginResponse.setToken(null);
        loginResponse.setRefreshToken(null);

        // Add security headers
        response.setHeader("X-Content-Type-Options", "nosniff");
        response.setHeader("X-Frame-Options", "DENY");
        response.setHeader("X-XSS-Protection", "1; mode=block");
        return new ResponseEntity<>(loginResponse, HttpStatus.OK);
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        UserProfileResponse userProfile = authService.getProfile(userDetails.getUsername());
        return ResponseEntity.ok(userProfile);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response,
                                       @CookieValue(name = "jwt", required = false) String accessToken,
                                       @CookieValue(name = "refreshToken", required = false) String refreshToken) {
        if (StringUtils.hasText(accessToken)) {
            tokenBlacklistService.blacklistToken(accessToken);
        }
        if (StringUtils.hasText(refreshToken)) {
            tokenBlacklistService.blacklistToken(refreshToken);
        }

        Cookie cookie = new Cookie("jwt", "");
        cookie.setHttpOnly(true);
        // cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge(0); // Immediately expire the cookie
        cookie.setAttribute("SameSite", "Lax");
        cookie.setDomain("103.77.243.143");

        response.addCookie(cookie);

        Cookie refreshTokenCookie = new Cookie("refreshToken", "");
        refreshTokenCookie.setHttpOnly(true);
        refreshTokenCookie.setPath("/");
        refreshTokenCookie.setMaxAge(0);
        refreshTokenCookie.setAttribute("SameSite", "Lax");
        refreshTokenCookie.setDomain("103.77.243.143");
        response.addCookie(refreshTokenCookie);

        // response.setHeader("Clear-Site-Data", "\"cache\", \"cookies\"");

        return ResponseEntity.ok().build();
    }
}
