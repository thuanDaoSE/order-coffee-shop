package com.coffeeshop.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;

import com.coffeeshop.backend.dto.common.ProductDTO;
import com.coffeeshop.backend.entity.Product;
import org.springframework.http.HttpStatus;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import com.coffeeshop.backend.service.ProductService;

@Controller
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping("/products")
    ResponseEntity<List<ProductDTO>> getAllProducts() {
        List<ProductDTO> products = productService.getAllProducts();
        return ResponseEntity.ok(products);
    }

    @GetMapping("/products/{productId}")
    ResponseEntity<ProductDTO> getProductById(Long productId) {
        ProductDTO product = productService.getProductById(productId);
        return ResponseEntity.ok(product);
    }

    @GetMapping("/products/category/{categoryName}")
    ResponseEntity<List<ProductDTO>> getProductsByCategory(String categoryName) {
        List<ProductDTO> products = productService.getProductsByCategory(categoryName);
        return ResponseEntity.ok(products);
    }

    @PostMapping("/products")
    ResponseEntity<ProductDTO> createProduct(@RequestBody Product product) {
        ProductDTO newProductDTO = productService.createProduct(product);
        return new ResponseEntity<>(newProductDTO, HttpStatus.CREATED);
    }

    @PutMapping("/products/{productId}")
    ResponseEntity<ProductDTO> updateProduct(@PathVariable Long productId, @RequestBody Product product) {
        ProductDTO updatedProduct = productService.updateProduct(productId, product);
        return ResponseEntity.ok(updatedProduct);
    }

    @DeleteMapping("/products/{productId}")
    ResponseEntity<Void> deleteProduct(@PathVariable Long productId) {
        productService.deleteProduct(productId);
        return ResponseEntity.noContent().build();
    }

}
