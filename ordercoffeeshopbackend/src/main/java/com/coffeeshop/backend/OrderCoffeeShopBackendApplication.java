package com.coffeeshop.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EntityScan("com.coffeeshop.backend.entity")
@EnableJpaRepositories("com.coffeeshop.backend.repository")
public class OrderCoffeeShopBackendApplication extends SpringBootServletInitializer {

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
        return application.sources(OrderCoffeeShopBackendApplication.class);
    }

    public static void main(String[] args) {
        try {
            // Handle the case when running with Spring Boot DevTools
            System.setProperty("spring.devtools.restart.enabled", "false");
            SpringApplication app = new SpringApplication(OrderCoffeeShopBackendApplication.class);
            app.run(args);
        } catch (Exception e) {
            if (!e.getClass().getName().contains("SilentExitException")) {
                System.err.println("Error starting application: " + e.getMessage());
                e.printStackTrace();
            }
        }
    }
}
