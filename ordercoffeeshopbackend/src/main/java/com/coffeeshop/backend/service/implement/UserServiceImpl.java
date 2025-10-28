package com.coffeeshop.backend.service.implement;

import com.coffeeshop.backend.enums.UserRole;
import com.coffeeshop.backend.exception.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;

import com.coffeeshop.backend.entity.User;
import com.coffeeshop.backend.repository.UserRepository;
import com.coffeeshop.backend.service.UserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public User saveUser(User user) {
        return userRepository.save(user);
    }

    @Override
    public Page<User> getAllUsers(String search, Pageable pageable) {
        return userRepository.findByEmailContainingIgnoreCaseOrFullnameContainingIgnoreCase(search, search, pageable);
    }

    @Override
    public User updateUserRole(Long userId, UserRole role) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setRole(role);
        return userRepository.save(user);
    }
}
