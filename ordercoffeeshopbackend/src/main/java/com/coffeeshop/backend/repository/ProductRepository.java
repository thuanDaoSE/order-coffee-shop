package com.coffeeshop.backend.repository;

import com.coffeeshop.backend.entity.Product;

import java.util.List;
import java.util.Optional;

import com.coffeeshop.backend.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategory(Category category);

    Optional<Product> findById(Long id);

    List<Product> findByCategory_Name(String categoryName);

    List<Product> findByIsActive(boolean isActive);

    List<Product> findByNameContainingIgnoreCaseAndIsActive(String name, boolean isActive);

    List<Product> findByCategory_NameAndNameContainingIgnoreCaseAndIsActive(String categoryName, String name, boolean isActive);

    List<Product> findByIsActiveAndNameContainingIgnoreCase(boolean isActive, String name);
}
