package com.coffeeshop.backend.service;

import com.coffeeshop.backend.dto.SignUpRequest;
import com.coffeeshop.backend.entity.User;
import com.coffeeshop.backend.enums.UserRole;
import com.coffeeshop.backend.exception.UserAlreadyExistsException;
import com.coffeeshop.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User registerUser(SignUpRequest signUpRequest) {
        // Check if username already exists
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            throw new UserAlreadyExistsException("Username is already taken!");
        }

        // Create new user
        User user = new User();
        user.setUsername(signUpRequest.getUsername());
        user.setPassword(passwordEncoder.encode(signUpRequest.getPassword()));
        
        // Set user role (default to CUSTOMER if not provided or invalid)
        try {
            user.setRole(UserRole.valueOf(signUpRequest.getRole().toUpperCase()));
        } catch (IllegalArgumentException e) {
            user.setRole(UserRole.CUSTOMER);
        }

        return userRepository.save(user);
    }
}
