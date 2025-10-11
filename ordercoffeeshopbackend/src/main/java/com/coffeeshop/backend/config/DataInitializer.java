package com.coffeeshop.backend.config;

import com.coffeeshop.backend.entity.Category;
import com.coffeeshop.backend.entity.Product;
import com.coffeeshop.backend.entity.ProductVariant;
import com.coffeeshop.backend.entity.User;
import com.coffeeshop.backend.enums.UserRole;
import com.coffeeshop.backend.repository.CategoryRepository;
import com.coffeeshop.backend.repository.ProductRepository;
import com.coffeeshop.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
        System.out.println("Initializing sample data...");

        // 1. Create Users
        createUsers();

        // 2. Create Categories
        Category catVietnamese = createCategory("Cà Phê Việt Nam");
        Category catMachine = createCategory("Cà Phê Máy");
        Category catTea = createCategory("Trà & Macchiato");
        Category catCake = createCategory("Bánh Ngọt");

        // 3. Create Products and Variants with the actual image filenames
        createProduct("Americano", "Cà phê đen đậm đặc pha với nước nóng, tạo nên hương vị đậm đà.", "Americano.png", catMachine,
                Arrays.asList(
                        createVariant("S", "35000.00", 100),
                        createVariant("M", "40000.00", 100),
                        createVariant("L", "45000.00", 100)
                ));

        createProduct("Cappuccino", "Sự kết hợp hoàn hảo giữa espresso, sữa nóng và bọt sữa mịn.", "Cappuccino.png", catMachine,
                Arrays.asList(
                        createVariant("M", "45000.00", 80),
                        createVariant("L", "50000.00", 80)
                ));

        createProduct("Espresso", "Một shot cà phê đậm đặc được chiết xuất bằng máy.", "Espresso.png", catMachine,
                Arrays.asList(
                        createVariant("Standard", "40000.00", 50)
                ));

        createProduct("Latte", "Espresso kết hợp với sữa tươi đánh nóng và một lớp bọt mỏng.", "Latte.png", catMachine,
                Arrays.asList(
                        createVariant("Nóng", "50000.00", 60),
                        createVariant("Đá", "50000.00", 60)
                ));

            System.out.println("Data initialization complete.================================================================================================");
        }
    }

    private void createUsers() {
        createUser("Admin", "admin@test.com", "12345678", UserRole.ADMIN);
        createUser("Barista", "barista@test.com", "12345678", UserRole.STAFF);
        createUser("Customer", "customer@test.com", "12345678", UserRole.CUSTOMER);
    }

    private void createUser(String name, String email, String password, UserRole role) {
        User user = new User();
        user.setFullname(name);
        user.setEmail(email);
        user.setPhone("0900000000"); // Thêm số điện thoại mặc định
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role);
        userRepository.save(user);
    }

    private Category createCategory(String name) {
        Category category = new Category();
        category.setName(name);
        // Lớp Category không có trường isActive
        return categoryRepository.save(category);
    }

    private void createProduct(String name, String description, String imageUrl, Category category, List<ProductVariant> variants) {
        Product product = new Product();
        product.setName(name);
        product.setDescription(description);
        product.setImageUrl(imageUrl);
        product.setCategory(category);
        product.setIsActive(true);
        // Gán product cho từng variant và thêm vào danh sách của product
        variants.forEach(variant -> {
            variant.setProduct(product);
            product.getVariants().add(variant);
        });
        productRepository.save(product);
    }

    private ProductVariant createVariant(String size, String price, int stock) {
        ProductVariant variant = new ProductVariant();
        // SKU là bắt buộc, tạo một SKU duy nhất dựa trên size và giá
        variant.setSku(size.toUpperCase() + "-" + price.replace(".", ""));
        variant.setSize(size);
        variant.setPrice(new BigDecimal(price));
        variant.setStockQuantity(stock);
        variant.setIsActive(true);
        return variant;
    }
}