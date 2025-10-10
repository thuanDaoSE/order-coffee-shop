package com.coffeeshop.backend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.coffeeshop.backend.dto.auth.RegisterResponse;
import com.coffeeshop.backend.entity.User;
import com.coffeeshop.backend.dto.auth.RegisterRequest;
import com.coffeeshop.backend.dto.auth.LoginRequest;
import com.coffeeshop.backend.dto.auth.LoginResponse;

@Mapper(componentModel = "spring")
public interface AuthMapper {

    @Mapping(target = "password", ignore = true)
    @Mapping(target = "role", ignore = true)
    User toUser(RegisterRequest registerRequest);

    @Mapping(target = "password", ignore = true)
    @Mapping(target = "role", ignore = true)
    User toUser(LoginRequest loginRequest);

    RegisterResponse toRegisterResponse(User user);

    LoginResponse toLoginResponse(User user, String token);
}