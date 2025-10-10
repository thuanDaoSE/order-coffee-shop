package com.coffeeshop.backend.config;

import io.github.resilience4j.ratelimiter.RateLimiter;
import io.github.resilience4j.ratelimiter.RateLimiterConfig;
import io.github.resilience4j.ratelimiter.RateLimiterRegistry;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Configuration
public class RateLimitingConfig {

    public static final String API_RATE_LIMITER = "apiRateLimiter";
    
    @Bean
    public RateLimiterRegistry rateLimiterRegistry() {
        // Configure rate limiting: 100 requests per minute per user
        RateLimiterConfig config = RateLimiterConfig.custom()
                .limitRefreshPeriod(Duration.ofMinutes(1))  // Refresh limit every minute
                .limitForPeriod(100)                       // Allow 100 requests per period
                .timeoutDuration(Duration.ofSeconds(5))     // Wait up to 5 seconds for a permit
                .build();

        return RateLimiterRegistry.of(config);
    }
    
    @Bean
    public RateLimiter rateLimiter(RateLimiterRegistry rateLimiterRegistry) {
        return rateLimiterRegistry.rateLimiter(API_RATE_LIMITER);
    }
    
    // You can define different rate limiters for different endpoints
    @Bean("strictRateLimiter")
    public RateLimiter strictRateLimiter(RateLimiterRegistry rateLimiterRegistry) {
        RateLimiterConfig config = RateLimiterConfig.custom()
                .limitRefreshPeriod(Duration.ofMinutes(1))
                .limitForPeriod(20)  // Only 20 requests per minute
                .timeoutDuration(Duration.ofSeconds(5))
                .build();
                
        return rateLimiterRegistry.rateLimiter("strictRateLimiter", config);
    }
}
