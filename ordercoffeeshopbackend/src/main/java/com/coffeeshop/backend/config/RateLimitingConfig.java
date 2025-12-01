package com.coffeeshop.backend.config;

import io.github.resilience4j.ratelimiter.RateLimiterConfig;
import io.github.resilience4j.ratelimiter.RateLimiterRegistry;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.security.Principal;
import java.time.Duration;

@Configuration
public class RateLimitingConfig {

    @Bean
    public RateLimiterConfig defaultRateLimiterConfig() {
        return RateLimiterConfig.custom()
                .limitRefreshPeriod(Duration.ofMinutes(1))
                .limitForPeriod(100) // Default: 100 requests per minute
                .timeoutDuration(Duration.ofSeconds(1))
                .build();
    }

    @Bean
    public RateLimiterRegistry rateLimiterRegistry(RateLimiterConfig defaultRateLimiterConfig) {
        return RateLimiterRegistry.of(defaultRateLimiterConfig);
    }
}
