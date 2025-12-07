package com.coffeeshop.backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true, securedEnabled = true, jsr250Enabled = true)
public class SecurityConfig {

        @Autowired
        private JwtAuthenticationFilter jwtAuthenticationFilter;

        @Value("${app.frontend-url-dev}")
        String frontendURL_dev;

        @Value("${app.frontend-url-production}")
        String frontendURL_production;

        // Bean này là nơi bạn sẽ định nghĩa các quy tắc bảo mật chính cho ứng dụng.
        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http)
                        throws Exception {
                http
                                .csrf(csrf -> csrf.disable())
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers("/api/r2/**",
                                                                "/api/shipping/**",
                                                                "/api/v1/payment/create-payment",
                                                                "/api/v1/payment/callback", "/api/v1/location/**",
                                                                "/api/v1/categories/**")
                                                .permitAll()
                                                .requestMatchers("/api/v1/auth/login", "/api/v1/auth/register", "/api/v1/auth/logout")
                                                .permitAll()
                                                .requestMatchers("/api/v1/payment/status/**", "/api/v1/addresses/**")
                                                .authenticated()
                                                .requestMatchers("/api/v1/products/**").permitAll()
                                                .requestMatchers("/api/v1/coupons/**").permitAll() // Add this line for
                                                                                                   // coupon validation
                                                .requestMatchers("/api/v1/reports/**").hasRole("ADMIN")
                                                .requestMatchers("/api/v1/users/**").hasAnyRole("CUSTOMER", "ADMIN", "STAFF")
                                                .requestMatchers("/api/v1/cart/**").hasRole("CUSTOMER")
                                                .requestMatchers("/api/v1/orders/**")
                                                .hasAnyRole("CUSTOMER", "ADMIN", "STAFF")
                                                .anyRequest().authenticated())
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        // =========================================================================
        // CÁC BEAN KHÁC CHO CẤU HÌNH SPRING SECURITY
        // =========================================================================

        // Bean cho PasswordEncoder: Cần thiết để mã hóa mật khẩu khi lưu trữ.
        // BCryptPasswordEncoder là một lựa chọn phổ biến và an toàn.
        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        // Bean cho AuthenticationManager: Quản lý quá trình xác thực
        // (username/password).
        // Mặc dù chúng ta dùng JWT, AuthenticationManager vẫn cần thiết cho các luồng
        // xác thực ban đầu (ví dụ: khi người dùng đăng nhập lần đầu để lấy JWT).
        @Bean
        public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
                return config.getAuthenticationManager();
        }

        // Bean cho UserDetailsService: Cung cấp thông tin người dùng cho Spring
        // Security.
        // Trong hệ thống JWT, UserDetailsService thường được dùng để lấy thông tin user
        // khi họ đăng nhập lần đầu để tạo JWT.
        // Sau khi có JWT, Spring Security sẽ sử dụng JwtAuthenticationFilter để xác
        // thực dựa trên token, không cần UserDetailsService nữa cho mỗi request.
        // Bạn cần triển khai interface này để lấy dữ liệu user từ database hoặc nguồn
        // khác.
        // Ví dụ: @Bean public UserDetailsService userDetailsService(UserRepository
        // userRepository) { ... }
        // Nếu bạn đã có bean UserDetailsService được định nghĩa ở nơi khác, bạn không
        // cần định nghĩa lại ở đây.

        // =========================================================================
        // CẤU HÌNH CORS (NẾU CẦN)
        // =========================================================================
        // Enhanced CORS configuration with more restrictive settings
        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();
                // In production, replace "*" with specific origins
                configuration.setAllowedOriginPatterns(Arrays.asList(
                                frontendURL_dev,
                                frontendURL_production,
                                "http://localhost:5173",
                                "http://103.77.243.143",
                                "https://7e1cea511162.ngrok-free.app"
                        ));
                configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
                configuration.setAllowedHeaders(Arrays.asList(
                                "Authorization",
                                "Content-Type",
                                "X-Requested-With",
                                "Accept",
                                "X-XSRF-TOKEN"));
                configuration.setExposedHeaders(Arrays.asList(
                                "Authorization",
                                "X-XSRF-TOKEN"));
                configuration.setAllowCredentials(true);
                configuration.setMaxAge(3600L); // 1 hour

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration); // Apply CORS configuration to all paths
                return source;
        }
}
