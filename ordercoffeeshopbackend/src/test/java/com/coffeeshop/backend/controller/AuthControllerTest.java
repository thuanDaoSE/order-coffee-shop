package com.coffeeshop.backend.controller;

import com.coffeeshop.backend.dto.SignUpRequest;
import com.coffeeshop.backend.entity.User;
import com.coffeeshop.backend.enums.UserRole;
import com.coffeeshop.backend.exception.UserAlreadyExistsException;
import com.coffeeshop.backend.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
// No need for @InjectMocks or @Mock with @WebMvcTest and @SpyBean
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import com.coffeeshop.backend.config.SecurityConfig;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@Import(SecurityConfig.class)
@ActiveProfiles("test")
public class AuthControllerTest {
    
    @Autowired
    private WebApplicationContext context;
    
    private MockMvc mockMvc;
    
    @MockBean
    private UserService userService;
    
    @Autowired
    private ObjectMapper objectMapper;

    private static final String TEST_EMAIL = "test@example.com";
    private static final String TEST_PASSWORD = "Password123#!";
    private static final String TEST_ROLE_STRING = "CUSTOMER";
    private static final UserRole TEST_ROLE_ENUM = UserRole.CUSTOMER;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
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

        // Verify service method was called
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

    @Test
    void registerUser_ShouldReturnBadRequest_WhenEmailIsInvalid() throws Exception {
        // Arrange
        SignUpRequest signUpRequest = createValidSignUpRequest();
        signUpRequest.setUsername("invalid-email");

        // Act & Assert
        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signUpRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("must be a valid email address")));
    }

    @Test
    void registerUser_ShouldReturnBadRequest_WhenPasswordIsTooShort() throws Exception {
        // Arrange
        SignUpRequest signUpRequest = createValidSignUpRequest();
        signUpRequest.setPassword("Sh0#"); // Less than 6 characters

        // Act & Assert
        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signUpRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Password must be between 6 and 100 characters")));
    }

    @Test
    void registerUser_ShouldReturnBadRequest_WhenRoleIsInvalid() throws Exception {
        // Arrange
        SignUpRequest signUpRequest = createValidSignUpRequest();
        signUpRequest.setRole("INVALID_ROLE");

        // Act & Assert
        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signUpRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Invalid role")));
    }

    @Test
    void registerUser_ShouldReturnBadRequest_WhenRequiredFieldsAreMissing() throws Exception {
        // Arrange - create request with missing fields
        String json = "{\"username\": \"\"}";

        // Act & Assert
        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Validation failed")));
    }

    @Test
    void registerUser_ShouldReturnBadRequest_WhenPasswordDoesNotMeetRequirements() throws Exception {
        // Test various password validation scenarios with the exact error message from validation
        String baseError = "password: Password must contain at least one digit, one lowercase, one uppercase, one special character and no whitespace";
        testInvalidPassword("lowercaseonly", baseError);
        testInvalidPassword("UPPERCASEONLY", baseError);
        testInvalidPassword("NoSpecialChars1", baseError);
        testInvalidPassword("NoNumber#$", baseError);
        testInvalidPassword("Sho", "password: Password must be between 6 and 100 characters");
        
        String veryLongPassword = String.join("", Collections.nCopies(101, "A")) + "a1#";
        testInvalidPassword(veryLongPassword, "password: Password must be between 6 and 100 characters");
    }
    private void testInvalidPassword(String password, String expectedError) throws Exception {
        SignUpRequest request = createValidSignUpRequest();
        request.setPassword(password);

        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString(expectedError)));
    }

    private SignUpRequest createValidSignUpRequest() {
        SignUpRequest request = new SignUpRequest();
        request.setUsername(TEST_EMAIL);
        request.setPassword(TEST_PASSWORD);
        request.setRole(TEST_ROLE_STRING);
        return request;
    }

    private User createMockUser() {
        User user = new User();
        user.setUsername(TEST_EMAIL);
        user.setPassword(TEST_PASSWORD);
        user.setRole(TEST_ROLE_ENUM);
        user.setId(1L); // Add ID for consistency
        return user;
    }
}
