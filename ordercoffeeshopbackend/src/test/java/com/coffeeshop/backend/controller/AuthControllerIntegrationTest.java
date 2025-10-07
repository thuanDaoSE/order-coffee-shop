package com.coffeeshop.backend.controller;

import com.coffeeshop.backend.config.SecurityConfig;
import com.coffeeshop.backend.dto.SignUpRequest;
import com.coffeeshop.backend.entity.User;
import com.coffeeshop.backend.enums.UserRole;
import com.coffeeshop.backend.exception.UserAlreadyExistsException;
import com.coffeeshop.backend.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@Import(SecurityConfig.class)
@ActiveProfiles("postgresql-test")
@ExtendWith(MockitoExtension.class)
public class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @Autowired
    private ObjectMapper objectMapper;

    private static final String TEST_EMAIL = "test@example.com";
    private static final String TEST_PASSWORD = "Password123#!";
    private static final String TEST_ROLE_STRING = "CUSTOMER";

    @Autowired
    private WebApplicationContext context;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
            .webAppContextSetup(context)
            .build();
        Mockito.reset(userService);
    }

    @Test
    void registerUser_ShouldReturnSuccess_WhenRegistrationIsSuccessful() throws Exception {
        // Arrange
        SignUpRequest signUpRequest = createValidSignUpRequest();
        User mockUser = createMockUser();
        
        when(userService.registerUser(any(SignUpRequest.class))).thenReturn(mockUser);

        // Act & Assert
        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signUpRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("User registered successfully"))
                .andExpect(jsonPath("$.data").value(TEST_EMAIL));

        verify(userService, times(1)).registerUser(any(SignUpRequest.class));
    }

    @Test
    void registerUser_ShouldReturnBadRequest_WhenUserAlreadyExists() throws Exception {
        // Arrange
        SignUpRequest signUpRequest = createValidSignUpRequest();
        
        when(userService.registerUser(any(SignUpRequest.class)))
            .thenThrow(new UserAlreadyExistsException("Username is already taken!"));

        // Act & Assert
        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signUpRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
                
        verify(userService, times(1)).registerUser(any(SignUpRequest.class));
    }

    private User createMockUser() {
        User user = new User();
        user.setUsername(TEST_EMAIL);
        user.setPassword(TEST_PASSWORD);
        user.setRole(UserRole.CUSTOMER);
        return user;
    }
    
    private SignUpRequest createValidSignUpRequest() {
        SignUpRequest request = new SignUpRequest();
        request.setUsername(TEST_EMAIL);
        request.setPassword(TEST_PASSWORD);
        request.setRole(TEST_ROLE_STRING);
        return request;
    }
}
