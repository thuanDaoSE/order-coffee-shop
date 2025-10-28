package com.coffeeshop.backend.service;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.coffeeshop.backend.entity.User;
import com.coffeeshop.backend.enums.UserRole;

@Service
public interface UserService {
    Optional<User> findByEmail(String email);

    User saveUser(User user);

    Page<User> getAllUsers(String search, Pageable pageable);

    User updateUserRole(Long userId, UserRole role);

}
