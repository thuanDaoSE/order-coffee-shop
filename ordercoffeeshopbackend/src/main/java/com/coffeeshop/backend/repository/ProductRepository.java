package com.coffeeshop.backend.repository;

import com.coffeeshop.backend.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Page<Product> findByIsActive(boolean isActive, Pageable pageable);

    List<Product> findByIsActive(boolean isActive);

    Page<Product> findByNameContainingIgnoreCaseAndIsActive(String name, boolean isActive, Pageable pageable);

    List<Product> findByCategory_Name(String categoryName);

    List<Product> findByCategory_NameAndNameContainingIgnoreCaseAndIsActive(String categoryName, String name, boolean isActive);

    List<Product> findByIsActiveAndNameContainingIgnoreCase(boolean isActive, String name);
}
