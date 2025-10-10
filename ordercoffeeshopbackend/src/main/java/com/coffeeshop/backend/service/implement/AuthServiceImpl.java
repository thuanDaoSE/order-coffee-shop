package com.coffeeshop.backend.service.implement;

import java.util.Optional;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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
import com.coffeeshop.backend.exception.UserAlreadyExistsException;

import jakarta.security.auth.message.AuthException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthMapper authMapper;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    @Override
    public RegisterResponse registerNewUser(RegisterRequest registerRequest) {
        Optional<User> userOptional = userRepository.findByUsername(registerRequest.getUsername());
        if (userOptional.isPresent()) {
            throw new UserAlreadyExistsException("User already exists");
        }

        User user = authMapper.toUser(registerRequest);
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setRole(UserRole.CUSTOMER);
        userRepository.save(user);
        return authMapper.toRegisterResponse(user);
    }

    @Override
    public LoginResponse login(LoginRequest loginRequest) {

        // 1. UỶ THÁC (DELEGATE) VIỆC XÁC THỰC CHO SPRING SECURITY
        // Nếu username/password sai, phương thức này sẽ tự động ném ra Exception (ví
        // dụ: BadCredentialsException).
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()));

        // 2. TẠO TOKEN TỪ OBJECT AUTHENTICATION ĐÃ XÁC THỰC
        String token = jwtTokenProvider.generateToken(authentication);

        // 3. LẤY ENTITY ĐÃ XÁC THỰC TỪ PRINCIPAL
        // Giả sử bạn đang dùng CustomUserDetails hoặc User Entity triển khai
        // UserDetails
        // Nếu không, bạn cần một bước tìm kiếm nhẹ nhàng, nhưng tốt nhất là lấy từ
        // Principal.
        User userFound = (User) authentication.getPrincipal(); // Giả sử User Entity của bạn implements UserDetails

        // 4. ÁNH XẠ VÀ TRẢ VỀ
        return authMapper.toLoginResponse(userFound, token);
    }

}
