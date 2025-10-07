package com.coffeeshop.backend.controller;

import com.coffeeshop.backend.config.JwtTokenProvider;
import com.coffeeshop.backend.config.SecurityConfig;
import com.coffeeshop.backend.dto.SignUpRequest;
import com.coffeeshop.backend.entity.User;
import com.coffeeshop.backend.enums.UserRole;
import com.coffeeshop.backend.exception.UserAlreadyExistsException;
import com.coffeeshop.backend.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.containsString;

import java.util.Collections;

@WebMvcTest(AuthController.class)
@Import(SecurityConfig.class)
@TestPropertySource(properties = {
    "jwt.secret=testSecretKeyThatIsLongEnoughForHS512Algorithm1234567890",
    "jwt.expiration=604800000",
    "spring.security.user.name=test",
    "spring.security.user.password=test"
})
public class AuthControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private UserService userService;
    
    @MockBean
    private JwtTokenProvider tokenProvider;
    
    @MockBean
    private PasswordEncoder passwordEncoder;
    
    @MockBean
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private ObjectMapper objectMapper;

    private static final String TEST_EMAIL = "test@example.com";
    private static final String TEST_PASSWORD = "Password123#!";
    private static final String TEST_ROLE_STRING = "CUSTOMER";
    private static final UserRole TEST_ROLE_ENUM = UserRole.CUSTOMER;

    @BeforeEach
    void setUp() {
        // Mock password encoder
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        
        // Reset mocks
        reset(userService, tokenProvider, authenticationManager);
    }

    @Test
    void registerUser_ShouldReturnSuccess_WhenRegistrationIsSuccessful() throws Exception {
        // Arrange
        User mockUser = createMockUser();
        SignUpRequest signUpRequest = createValidSignUpRequest();
        
        when(userService.registerUser(any(SignUpRequest.class))).thenReturn(mockUser);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");

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
        // No need to verify passwordEncoder.encode() here since we're mocking userService.registerUser()
    }

    @Test
    void registerUser_ShouldReturnBadRequest_WhenUserAlreadyExists() throws Exception {
        // Arrange
        SignUpRequest signUpRequest = createValidSignUpRequest();
        String errorMessage = "Username is already taken!";
        
        when(userService.registerUser(any(SignUpRequest.class)))
            .thenThrow(new UserAlreadyExistsException(errorMessage));

        // Act & Assert
        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signUpRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value(errorMessage));
                
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
        user.setId(1L);
        return user;
    }
    
    // Login test cases
    
    @Test
    void login_ShouldReturnSuccess_WhenCredentialsAreValid() throws Exception {
        // Arrange
        User mockUser = createMockUser();
        String mockToken = "mock.jwt.token";
        
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenReturn(mock(UsernamePasswordAuthenticationToken.class));
        when(userService.authenticateUser(TEST_EMAIL, TEST_PASSWORD)).thenReturn(mockUser);
        when(tokenProvider.generateToken(any(Authentication.class))).thenReturn(mockToken);
        
        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"" + TEST_EMAIL + "\",\"password\":\"" + TEST_PASSWORD + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Login successful"))
                .andExpect(jsonPath("$.data.token").value(mockToken))
                .andExpect(jsonPath("$.data.username").value(TEST_EMAIL))
                .andExpect(jsonPath("$.data.role").value(TEST_ROLE_STRING));
                
        // Verify service method was called
        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(userService, times(1)).authenticateUser(TEST_EMAIL, TEST_PASSWORD);
        verify(tokenProvider, times(1)).generateToken(any(Authentication.class));
    }
    
    @Test
    void login_ShouldReturnBadRequest_WhenCredentialsAreMissing() throws Exception {
        // Act & Assert - missing username and password
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value(containsString("Validation failed")));
                
        // Verify no authentication was attempted
        verify(authenticationManager, never()).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }
    
    @Test
    void login_ShouldReturnUnauthorized_WhenCredentialsAreInvalid() throws Exception {
        // Arrange
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenThrow(new BadCredentialsException("Invalid credentials"));
        
        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"wrong@example.com\",\"password\":\"wrongpass\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Invalid username or password"));
                
        // Verify authentication was attempted
        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }
    
    @Test
    void login_ShouldReturnInternalServerError_WhenUnexpectedErrorOccurs() throws Exception {
        // Arrange
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenThrow(new RuntimeException("Unexpected error"));
        
        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"" + TEST_EMAIL + "\",\"password\":\"" + TEST_PASSWORD + "\"}"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("An error occurred during login"));
                
        // Verify authentication was attempted
        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }
}
