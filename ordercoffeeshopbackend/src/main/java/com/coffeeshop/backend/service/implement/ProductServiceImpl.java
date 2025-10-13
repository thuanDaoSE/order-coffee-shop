package com.coffeeshop.backend.service.implement;

import com.coffeeshop.backend.dto.product.ProductDTO;
import com.coffeeshop.backend.dto.product.ProductRequest;
import com.coffeeshop.backend.entity.Category;
import com.coffeeshop.backend.entity.Product;
import com.coffeeshop.backend.entity.ProductVariant;
import com.coffeeshop.backend.exception.ResourceNotFoundException;
import com.coffeeshop.backend.mapper.ProductMapper;
import com.coffeeshop.backend.repository.CategoryRepository;
import com.coffeeshop.backend.repository.ProductRepository;
import com.coffeeshop.backend.service.ProductService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductMapper productMapper;

    @Override
    public List<ProductDTO> getAllProducts() {
        List<Product> products = productRepository.findAll();
        return products.stream()
                .map(productMapper::toProductDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductDTO> getProductsByCategory(String categoryName) {
        List<Product> products = productRepository.findByCategory_Name(categoryName);
        return products.stream()
                .map(productMapper::toProductDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ProductDTO getProductById(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
        return productMapper.toProductDTO(product);
    }

    @Override
    @Transactional
    public ProductDTO createProduct(ProductRequest productRequest) {
        Category category = categoryRepository.findById(productRequest.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + productRequest.getCategoryId()));

        Product product = new Product();
        product.setName(productRequest.getName());
        product.setDescription(productRequest.getDescription());
        product.setImageUrl(productRequest.getImageUrl());
        product.setCategory(category);
        product.setIsActive(productRequest.getIsActive());

        productRequest.getVariants().forEach(variantRequest -> {
            ProductVariant variant = new ProductVariant();
            variant.setSku(variantRequest.getSku());
            variant.setSize(variantRequest.getSize());
            variant.setPrice(variantRequest.getPrice());
            variant.setStockQuantity(variantRequest.getStockQuantity());
            variant.setIsActive(variantRequest.getIsActive());
            product.getVariants().add(variant);
        });

        Product savedProduct = productRepository.save(product);
        return productMapper.toProductDTO(savedProduct);
    }

    @Override
    @Transactional
    public ProductDTO updateProduct(Long productId, ProductRequest productRequest) {
        Product existingProduct = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        Category category = categoryRepository.findById(productRequest.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + productRequest.getCategoryId()));

        existingProduct.setName(productRequest.getName());
        existingProduct.setDescription(productRequest.getDescription());
        existingProduct.setImageUrl(productRequest.getImageUrl());
        existingProduct.setCategory(category);
        existingProduct.setIsActive(productRequest.getIsActive());

        // For simplicity, clear existing variants and add new ones.
        // A more sophisticated implementation would update existing variants.
        existingProduct.getVariants().clear();
        productRequest.getVariants().forEach(variantRequest -> {
            ProductVariant variant = new ProductVariant();
            variant.setSku(variantRequest.getSku());
            variant.setSize(variantRequest.getSize());
            variant.setPrice(variantRequest.getPrice());
            variant.setStockQuantity(variantRequest.getStockQuantity());
            variant.setIsActive(variantRequest.getIsActive());
            existingProduct.getVariants().add(variant);
        });

        Product updatedProduct = productRepository.save(existingProduct);
        return productMapper.toProductDTO(updatedProduct);
    }

    @Override
    public void deleteProduct(Long productId) {
        Product existingProduct = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
        productRepository.delete(existingProduct);
    }
}