// package com.coffeeshop.backend.security;

// import org.springframework.stereotype.Component;
// import java.io.IOException;

// import jakarta.servlet.Filter;
// import jakarta.servlet.FilterChain;
// import jakarta.servlet.FilterConfig;
// import jakarta.servlet.ServletException;
// import jakarta.servlet.ServletRequest;
// import jakarta.servlet.ServletResponse;
// import jakarta.servlet.http.HttpServletRequest;
// import jakarta.servlet.http.HttpServletResponse;

// @Component
// public class CorsFilter implements Filter {
//     @Override
// public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) 
//         throws IOException, ServletException {
//     HttpServletResponse response = (HttpServletResponse) res;
//     HttpServletRequest request = (HttpServletRequest) req;

//     // Handle preflight requests first
//     if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
//         response.setHeader("Access-Control-Allow-Origin", "https://b26963c8d867.ngrok-free.app");
//         response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
//         response.setHeader("Access-Control-Allow-Headers", "content-type, authorization");
//         response.setHeader("Access-Control-Allow-Credentials", "true");
//         response.setHeader("Access-Control-Max-Age", "3600");
//         response.setStatus(HttpServletResponse.SC_OK);
//         return;
//     }

//     // For actual requests
//     response.setHeader("Access-Control-Allow-Origin", "https://b26963c8d867.ngrok-free.app");
//     response.setHeader("Access-Control-Allow-Credentials", "true");
//     response.setHeader("Access-Control-Expose-Headers", "Authorization");
    
//     chain.doFilter(req, res);
// }

//     @Override
//     public void init(FilterConfig filterConfig) {}

//     @Override
//     public void destroy() {}
// }
