package com.coffeeshop.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(classes = OrderCoffeeShopBackendApplication.class)
class OrderCoffeeShopBackendApplicationTests {

    @Test
    void contextLoads() {
        assertTrue(true, "Application context loaded successfully");
        System.out.println("Application context test passed!");
    }
}
