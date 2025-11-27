package com.coffeeshop.backend.repository;

import com.coffeeshop.backend.entity.ProductStock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductStockRepository extends JpaRepository<ProductStock, Long> {
    Optional<ProductStock> findByProductVariantIdAndStoreId(Long productVariantId, Long storeId);
}
