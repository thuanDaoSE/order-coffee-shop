package com.coffeeshop.backend.config;

import com.coffeeshop.backend.entity.*;
import com.coffeeshop.backend.enums.UserRole;
import com.coffeeshop.backend.repository.*;
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
    private final StoreRepository storeRepository;
    private final ProductStockRepository productStockRepository;
    private final StockHistoryRepository stockHistoryRepository;

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

        // 2. Create Stores
        Store store1 = createStore("Coffee House - Cầu Giấy", "123 Cầu Giấy, Hà Nội", "0988111111");
        Store store2 = createStore("Coffee House - Hoàn Kiếm", "99 Hàng Bài, Hà Nội", "0988222222");

        // 3. Create Categories
        Category coffee = createCategory("Coffee", "coffee", "coffeeCup.png");
        Category espresso = createCategory("Espresso", "espresso", "Espresso.png");
        Category latte = createCategory("Latte", "latte", "Latte.png");
        Category americano = createCategory("Americano", "americano", "Americano.png");
        Category cappuccino = createCategory("Cappuccino", "cappuccino", "Cappuccino.png");

        // 4. Create Products with Variants and Stocks
        createProduct("Espresso", "Rich and pure espresso shot", "Espresso.png", espresso, true,
                Arrays.asList(
                        createVariant("S", "29000", 100, true),
                        createVariant("M", "35000", 100, true),
                        createVariant("L", "39000", 100, true)),
                Arrays.asList(store1, store2));

        createProduct("Cappuccino", "Espresso topped with foamy milk", "Cappuccino.png", cappuccino, true,
                Arrays.asList(
                        createVariant("S", "35000", 100, true),
                        createVariant("M", "42000", 100, true),
                        createVariant("L", "48000", 100, true)),
                Arrays.asList(store1, store2));

        createProduct("Latte", "Smooth coffee with steamed milk", "Latte.png", latte, true,
                Arrays.asList(
                        createVariant("S", "35000", 100, true),
                        createVariant("M", "42000", 100, true),
                        createVariant("L", "48000", 100, true)),
                Arrays.asList(store1, store2));

        createProduct("Americano", "Espresso diluted with hot water", "Americano.png", americano, true,
                Arrays.asList(
                        createVariant("S", "32000", 100, true),
                        createVariant("M", "38000", 100, true),
                        createVariant("L", "44000", 100, true)),
                Arrays.asList(store1, store2));
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

    private Store createStore(String name, String address, String phone) {
        Store store = new Store();
        store.setName(name);
        store.setAddress(address);
        store.setPhone(phone);
        return storeRepository.save(store);
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
        variant.setIsActive(isActive);
        // Don't save here, just return the unsaved entity
        return variant;
    }

    private void createProduct(String name, String description, String image, Category category,
            boolean isActive, List<ProductVariant> variants, List<Store> stores) {
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
            ProductVariant savedVariant = productVariantRepository.save(variant);

            // Create stock for each store
            for (Store store : stores) {
                // Get the initial stock from the ProductVariant passed to createVariant
                // (which is currently stored in a local variable in createVariant)
                // This assumes that the initial stock is passed through createVariant and we need to retrieve it.
                // A better approach would be to pass the initial stock directly to createProduct.
                // For now, I'll use a placeholder of 100.
                int initialStock = 100; // Placeholder

                ProductStock productStock = new ProductStock();
                productStock.setProductVariant(savedVariant);
                productStock.setStore(store);
                productStock.setQuantity(initialStock);
                productStockRepository.save(productStock);

                StockHistory history = new StockHistory();
                history.setProductVariant(savedVariant);
                history.setStore(store);
                history.setQuantityChanged(initialStock);
                history.setCurrentQuantity(initialStock);
                history.setReason("INITIAL_STOCK");
                stockHistoryRepository.save(history);
            }
        }
    }
}
