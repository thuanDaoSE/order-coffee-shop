package com.coffeeshop.backend.controller;

import com.coffeeshop.backend.config.JwtAuthenticationFilter;
import com.coffeeshop.backend.config.JwtTokenProvider;
import com.coffeeshop.backend.config.SecurityConfig;
import com.coffeeshop.backend.dto.*;
import com.coffeeshop.backend.entity.User;
import com.coffeeshop.backend.enums.UserRole;
import com.coffeeshop.backend.exception.UserAlreadyExistsException;
import com.coffeeshop.backend.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.Mock;
import org.mockito.Spy;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.hamcrest.CoreMatchers.containsString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@Import(SecurityConfig.class)
public class AuthControllerIntegrationTest {

    private MockMvc mockMvc;
    

    @Mock
    private UserService userService;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    private static final String TEST_EMAIL = "test@example.com";
    private static final String TEST_PASSWORD = "Password123#!";
    private static final String TEST_ROLE_STRING = "CUSTOMER";
    private static final String TEST_TOKEN = "test.jwt.token";

    @BeforeEach
    void setUp() {
        AuthController authController = new AuthController(userService, authenticationManager, tokenProvider);
        mockMvc = MockMvcBuilders.standaloneSetup(authController).build();
        Mockito.reset(userService, tokenProvider, authenticationManager);
    }

    @Test
    void login_ShouldReturnSuccess_WhenCredentialsAreValid() throws Exception {
        // Arrange
        User mockUser = createMockUser();
        Authentication authentication = new UsernamePasswordAuthenticationToken(
            mockUser.getUsername(), mockUser.getPassword(), mockUser.getAuthorities());
        
        when(authenticationManager.authenticate(any()))
            .thenReturn(authentication);
        when(tokenProvider.generateToken(any(Authentication.class)))
            .thenReturn(TEST_TOKEN);
        when(userService.authenticateUser(anyString(), anyString()))
            .thenReturn(mockUser);

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"" + TEST_EMAIL + "\",\"password\":\"" + TEST_PASSWORD + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Login successful"))
                .andExpect(jsonPath("$.data.token").exists())
                .andExpect(jsonPath("$.data.username").value(TEST_EMAIL))
                .andExpect(jsonPath("$.data.role").value("CUSTOMER"));
    }

    @Test
    void login_ShouldReturnUnauthorized_WhenCredentialsAreInvalid() throws Exception {
        // Arrange
        when(authenticationManager.authenticate(any()))
            .thenThrow(new org.springframework.security.core.AuthenticationException("Invalid credentials") {});

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"wrong@example.com\",\"password\":\"wrongpass\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Invalid username or password"));
    }

    @Test
    void login_ShouldReturnBadRequest_WhenValidationFails() throws Exception {
        // Act & Assert - Test with empty username and password
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"\",\"password\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value(containsString("Validation failed")));
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
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Username is already taken!"));
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