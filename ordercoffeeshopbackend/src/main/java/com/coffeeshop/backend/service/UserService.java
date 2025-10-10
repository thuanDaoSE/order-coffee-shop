package com.coffeeshop.backend.service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.coffeeshop.backend.entity.User;

@Service
public interface UserService {
    Optional<User> findByUsername(String username);

    User saveUser(User user);

}
