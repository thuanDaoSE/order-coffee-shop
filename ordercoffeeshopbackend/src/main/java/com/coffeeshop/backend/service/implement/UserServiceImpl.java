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

import org.springframework.security.core.context.SecurityContextHolder;

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
        User userToUpdate = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(currentUsername).orElseThrow(() -> new ResourceNotFoundException("Current user not found"));

        if (currentUser.getId().equals(userToUpdate.getId())) {
            throw new IllegalArgumentException("Admins cannot change their own role.");
        }

        userToUpdate.setRole(role);
        return userRepository.save(userToUpdate);
    }

    @Override
    public User getProfile(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Override
    public User updateProfile(String email, com.coffeeshop.backend.dto.user.UserDTO userDTO) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setFullname(userDTO.getFullname());
        user.setPhone(userDTO.getPhone());
        return userRepository.save(user);
    }
}
