package com.coffeeshop.backend.service;

import org.springframework.stereotype.Service;

import com.coffeeshop.backend.dto.auth.LoginRequest;
import com.coffeeshop.backend.dto.auth.LoginResponse;
import com.coffeeshop.backend.dto.auth.RegisterRequest;
import com.coffeeshop.backend.dto.auth.RegisterResponse;

@Service
public interface AuthService {
    RegisterResponse registerNewUser(RegisterRequest registerRequest);

    LoginResponse login(LoginRequest loginRequest);

}
