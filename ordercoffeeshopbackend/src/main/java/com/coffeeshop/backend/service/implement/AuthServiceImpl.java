package com.coffeeshop.backend.service.implement;

import java.util.Optional;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import com.coffeeshop.backend.dto.auth.LoginRequest;
import com.coffeeshop.backend.dto.auth.LoginResponse;
import com.coffeeshop.backend.dto.auth.RegisterRequest;
import com.coffeeshop.backend.dto.auth.RegisterResponse;
import com.coffeeshop.backend.entity.User;
import com.coffeeshop.backend.enums.UserRole;
import com.coffeeshop.backend.exception.AuthenticationException;
import com.coffeeshop.backend.mapper.AuthMapper;
import com.coffeeshop.backend.repository.UserRepository;
import com.coffeeshop.backend.security.JwtTokenProvider;
import com.coffeeshop.backend.service.AuthService;
import com.coffeeshop.backend.exception.EmailAlreadyExistsException;

import com.coffeeshop.backend.dto.auth.UserProfileResponse;
import com.coffeeshop.backend.exception.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthMapper authMapper;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    @Override
    public RegisterResponse registerNewUser(RegisterRequest registerRequest) {
        log.info("Registering new user with email: {}", registerRequest.getEmail());
        log.info("Password from request: {}", registerRequest.getPassword());
        Optional<User> userOptional = userRepository.findByEmail(registerRequest.getEmail());
        if (userOptional.isPresent()) {
            throw new EmailAlreadyExistsException("Email already exists");
        }

        User user = authMapper.toUser(registerRequest);
        String encodedPassword = passwordEncoder.encode(registerRequest.getPassword());
        log.info("Encoded password: {}", encodedPassword);
        user.setPassword(encodedPassword);
        user.setRole(UserRole.CUSTOMER);
        userRepository.save(user);
        return authMapper.toRegisterResponse(user);
    }

    @Override
    public LoginResponse login(LoginRequest loginRequest) {
        log.info("Attempting login for email: {}", loginRequest.getEmail());
        log.info("Password from request: {}", loginRequest.getPassword());

        // 1. UỶ THÁC (DELEGATE) VIỆC XÁC THỰC CHO SPRING SECURITY
        // Nếu username/password sai, phương thức này sẽ tự động ném ra Exception (ví
        // dụ: BadCredentialsException).
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()));

        // 2. TẠO TOKEN TỪ OBJECT AUTHENTICATION ĐÃ XÁC THỰC
        String token = jwtTokenProvider.generateToken(authentication);
        String refreshToken = jwtTokenProvider.generateRefreshToken(authentication);

        // 3. LẤY USERNAME TỪ PRINCIPAL VÀ TÌM USER TRONG DATABASE
        String username = authentication.getName();
        User userFound = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + username));

        // 4. ÁNH XẠ VÀ TRẢ VỀ
        return authMapper.toLoginResponse(userFound, token, refreshToken);
    }



    @Override
    public LoginResponse refreshToken(String refreshToken) {
        if (jwtTokenProvider.validateToken(refreshToken)) {
            String email = jwtTokenProvider.getEmailFromToken(refreshToken);
            User user = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
            Authentication authentication = new UsernamePasswordAuthenticationToken(user.getEmail(), null, java.util.Collections.singletonList(new SimpleGrantedAuthority(user.getRole().name())));
            String newAccessToken = jwtTokenProvider.generateToken(authentication);
            String newRefreshToken = jwtTokenProvider.generateRefreshToken(authentication);
            return authMapper.toLoginResponse(user, newAccessToken, newRefreshToken);
        } else {
            throw new AuthenticationException("Invalid refresh token");
        }
    }

    @Override
    public UserProfileResponse getProfile(String username) {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + username));
        return authMapper.toUserProfileResponse(user);
    }

}
