package com.coffeeshop.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.coffeeshop.backend.dto.common.ProductDTO;
import com.coffeeshop.backend.entity.Product;

@Service
public interface ProductService {

    List<ProductDTO> getAllProducts();

    List<ProductDTO> getProductsByCategory(String categoryName);

    ProductDTO getProductById(Long productId);

    ProductDTO createProduct(Product product);

    ProductDTO updateProduct(Long productId, Product updateProduct);

    ProductDTO deleteProduct(Long productId);
}
