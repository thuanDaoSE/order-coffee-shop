package com.coffeeshop.backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
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

import lombok.RequiredArgsConstructor;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    // Bean này là nơi bạn sẽ định nghĩa các quy tắc bảo mật chính cho ứng dụng.
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthenticationFilter jwtAuthenticationFilter)
            throws Exception {
        http
                // 1. Vô hiệu hóa CSRF: Với JWT stateless, CSRF thường không cần thiết.
                // CSRF (Cross-Site Request Forgery) là một loại tấn công mà kẻ tấn công có thể
                // lừa người dùng thực hiện các hành động không mong muốn trên ứng dụng web.
                .csrf(csrf -> csrf.disable())

                // 2. Cấu hình CORS (Cross-Origin Resource Sharing)
                // Cho phép truy cập từ các domain khác nhau nếu cần thiết (ví dụ: frontend chạy
                // trên domain khác backend).
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 3. Định nghĩa các quy tắc ủy quyền (Authorization)
                .authorizeHttpRequests(auth -> auth
                        // Authentication endpoints
                        .requestMatchers("/api/v1/auth/login").permitAll()
                        .requestMatchers("/api/v1/auth/register").permitAll()

                        // Admin-only endpoints
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")

                        // User-only endpoints (or authenticated users)
                        .requestMatchers("/api/v1/users/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers("/api/v1/products/**").hasAnyRole("USER", "ADMIN")
                        // .requestMatchers("/api/v1/products/**").permitAll()
                        .requestMatchers("/api/v1/cart/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers("/api/v1/orders/**").hasAnyRole("USER", "ADMIN")

                        // // Public endpoints (if any, e.g., viewing products without login)

                        // // All other requests require authentication
                        .anyRequest().authenticated())

                // 4. Cấu hình quản lý session
                // Với JWT, chúng ta muốn ứng dụng stateless, tức là không lưu trữ session trên
                // server.
                // SessionCreationPolicy.STATELESS đảm bảo mỗi request là độc lập.
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 5. Thêm bộ lọc JWT tùy chỉnh vào trước bộ lọc xác thực mặc định.
                // Bộ lọc JWT này sẽ kiểm tra token JWT trong mỗi request đến.
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class); // Quan trọng:
                                                                                                       // Chèn
                                                                                                       // JwtAuthenticationFilter
                                                                                                       // trước
                                                                                                       // UsernamePasswordAuthenticationFilter

        return http.build(); // Xây dựng và trả về SecurityFilterChain
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
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:3000",
                "http://localhost:5173" // React default
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
