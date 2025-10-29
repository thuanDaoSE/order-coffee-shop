package com.coffeeshop.backend.service;

import java.util.List;

import com.coffeeshop.backend.dto.product.ProductDTO;
import com.coffeeshop.backend.dto.product.ProductRequest;

public interface ProductService {

    List<ProductDTO> getAllProducts(String search);

    List<ProductDTO> getAllProductsForAdmin();

    List<ProductDTO> getProductsByCategory(String categoryName, String search);

    ProductDTO getProductById(Long productId);

    ProductDTO createProduct(ProductRequest productRequest);

    ProductDTO updateProduct(Long productId, ProductRequest productRequest);

    void deleteProduct(Long productId);

    ProductDTO updateProductStatus(Long productId, Boolean isActive);
}