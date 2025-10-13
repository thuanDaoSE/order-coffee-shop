package com.coffeeshop.backend.config;

import com.coffeeshop.backend.entity.Category;
import com.coffeeshop.backend.entity.Product;
import com.coffeeshop.backend.entity.ProductVariant;
import com.coffeeshop.backend.entity.User;
import com.coffeeshop.backend.enums.UserRole;
import com.coffeeshop.backend.repository.CategoryRepository;
import com.coffeeshop.backend.repository.ProductRepository;
import com.coffeeshop.backend.repository.ProductVariantRepository;
import com.coffeeshop.backend.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        initializeData();
    }

    @PostConstruct
    @Transactional
    public void initializeData() {
        try {
            if (userRepository.count() == 0) {
                log.info("Initializing application data...");
                createInitialData();
                log.info("Application data initialization completed successfully.");
            }
        } catch (Exception e) {
            log.error("Error initializing application data", e);
            throw new RuntimeException("Failed to initialize application data", e);
        }
    }

    private void createInitialData() {
        // 1. Create Users
        User admin = createUser("Admin User", "admin@coffeeshop.com", "admin123", UserRole.ADMIN, "0987654321");
        User staff = createUser("Staff Member", "staff@coffeeshop.com", "staff123", UserRole.STAFF, "0987654322");
        User customer = createUser("Customer", "customer@coffeeshop.com", "customer123", UserRole.CUSTOMER, "0987654323");

        // 2. Create Categories
        Category coffee = createCategory("Coffee", "coffee", "coffeeCup.png");
        Category espresso = createCategory("Espresso", "espresso", "Espresso.png");
        Category latte = createCategory("Latte", "latte", "Latte.png");
        Category americano = createCategory("Americano", "americano", "Americano.png");
        Category cappuccino = createCategory("Cappuccino", "cappuccino", "Cappuccino.png");

        // 3. Create Products with Variants
        createProduct("Espresso", "Rich and pure espresso shot", "Espresso.png", espresso, true,
                Arrays.asList(
                        createVariant("S", "29000", 100, true),
                        createVariant("M", "35000", 100, true),
                        createVariant("L", "39000", 100, true)));

        createProduct("Cappuccino", "Espresso topped with foamy milk", "Cappuccino.png", cappuccino, true,
                Arrays.asList(
                        createVariant("S", "35000", 100, true),
                        createVariant("M", "42000", 100, true),
                        createVariant("L", "48000", 100, true)));

        createProduct("Latte", "Smooth coffee with steamed milk", "Latte.png", latte, true,
                Arrays.asList(
                        createVariant("S", "35000", 100, true),
                        createVariant("M", "42000", 100, true),
                        createVariant("L", "48000", 100, true)));

        createProduct("Americano", "Espresso diluted with hot water", "Americano.png", americano, true,
                Arrays.asList(
                        createVariant("S", "32000", 100, true),
                        createVariant("M", "38000", 100, true),
                        createVariant("L", "44000", 100, true)));
    }

    private User createUser(String fullName, String email, String password, UserRole role, String phone) {
        User user = new User();
        user.setFullname(fullName);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role);
        user.setPhone(phone);
        return userRepository.save(user);
    }

    private Category createCategory(String name, String slug, String image) {
        Category category = new Category();
        category.setName(name);
        category.setSlug(slug);
        category.setImage("/" + image);
        return categoryRepository.save(category);
    }

    private ProductVariant createVariant(String size, String price, int stock, boolean isActive) {
        ProductVariant variant = new ProductVariant();
        variant.setSku(size.toUpperCase() + "-" + price.replace(".", ""));
        variant.setSize(size);
        variant.setPrice(new BigDecimal(price));
        variant.setStockQuantity(stock);
        variant.setIsActive(isActive);
        // Don't save here, just return the unsaved entity
        return variant;
    }

    private void createProduct(String name, String description, String image, Category category,
            boolean isActive, List<ProductVariant> variants) {
        // Create and save the product first
        Product product = new Product();
        product.setName(name);
        product.setDescription(description);
        product.setImageUrl("/" + image);
        product.setCategory(category);
        product.setIsActive(isActive);
        Product savedProduct = productRepository.save(product);

        // Create and save each variant with the product reference
        for (ProductVariant variant : variants) {
            variant.setProduct(savedProduct);
            productVariantRepository.save(variant);
        }
    }
}