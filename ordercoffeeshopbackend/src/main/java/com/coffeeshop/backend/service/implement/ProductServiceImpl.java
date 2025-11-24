package com.coffeeshop.backend.service.implement;

import com.coffeeshop.backend.dto.product.ProductDTO;
import com.coffeeshop.backend.dto.product.ProductRequest;
import com.coffeeshop.backend.dto.product.ProductVariantRequest;
import com.coffeeshop.backend.entity.Category;
import com.coffeeshop.backend.entity.Product;
import com.coffeeshop.backend.entity.ProductVariant;
import com.coffeeshop.backend.exception.ResourceNotFoundException;
import com.coffeeshop.backend.mapper.ProductMapper;
import com.coffeeshop.backend.repository.CategoryRepository;
import com.coffeeshop.backend.repository.ProductRepository;
import com.coffeeshop.backend.service.R2Service;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import com.coffeeshop.backend.service.ProductService;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductMapper productMapper;
    private final com.coffeeshop.backend.repository.OrderDetailRepository orderDetailRepository;
    private final R2Service r2Service;

    @Override
    @Cacheable("products")
    public Page<ProductDTO> getAllProducts(String search, Pageable pageable) {
        Page<Product> products;
        if (search != null && !search.isEmpty()) {
            products = productRepository.findByNameContainingIgnoreCaseAndIsActive(search, true, pageable);
        } else {
            products = productRepository.findByIsActive(true, pageable);
        }
        return products.map(productMapper::toProductDTO);
    }

    @Override
    public List<ProductDTO> getAllProductsList() {
        List<Product> products = productRepository.findByIsActive(true);
        return products.stream()
                .map(productMapper::toProductDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Page<ProductDTO> getAllProductsForAdmin(Pageable pageable) {
        Page<Product> products = productRepository.findAll(pageable);
        return products.map(productMapper::toProductDTO);
    }

    @Override
    public List<ProductDTO> getProductsByCategory(String categoryName, String search) {
        List<Product> products;
        if ("best-selling".equalsIgnoreCase(categoryName)) {
            // Custom logic for best-selling products
            products = orderDetailRepository.findAll().stream()
                .collect(Collectors.groupingBy(od -> od.getProductVariant().getProduct(),
                    Collectors.summingInt(od -> od.getQuantity())))
                .entrySet().stream()
                .sorted(Map.Entry.<Product, Integer>comparingByValue().reversed())
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
        } else if (search != null && !search.isEmpty()) {
            products = productRepository.findByCategory_NameAndNameContainingIgnoreCaseAndIsActive(categoryName, search, true);
        } else {
            products = productRepository.findByCategory_Name(categoryName);
        }
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
            variant.setProduct(product);
            product.getVariants().add(variant);
        });

        Product savedProduct = productRepository.save(product);
        return productMapper.toProductDTO(savedProduct);
    }

    @Override
    @Transactional
    public ProductDTO updateProduct(Long productId, ProductRequest productRequest) {
        log.info("Updating product with id: {}", productId);
        log.info("Request body: {}", productRequest);

        Product existingProduct = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
        log.info("Product before update: {}", existingProduct);

        Category category = categoryRepository.findById(productRequest.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + productRequest.getCategoryId()));

        existingProduct.setName(productRequest.getName());
        existingProduct.setDescription(productRequest.getDescription());
        existingProduct.setImageUrl(productRequest.getImageUrl());
        existingProduct.setCategory(category);
        existingProduct.setIsActive(productRequest.getIsActive());

        // --- REVISED VARIANT MANAGEMENT ---
        Map<String, ProductVariant> existingVariantsMap = existingProduct.getVariants().stream()
                .collect(Collectors.toMap(ProductVariant::getSku, variant -> variant));

        List<ProductVariant> updatedVariants = new ArrayList<>();

        for (ProductVariantRequest variantRequest : productRequest.getVariants()) {
            ProductVariant existingVariant = existingVariantsMap.get(variantRequest.getSku());
            if (existingVariant != null) {
                // Update existing variant
                existingVariant.setSize(variantRequest.getSize());
                existingVariant.setPrice(variantRequest.getPrice());
                existingVariant.setStockQuantity(variantRequest.getStockQuantity());
                existingVariant.setIsActive(variantRequest.getIsActive());
                updatedVariants.add(existingVariant);
                existingVariantsMap.remove(variantRequest.getSku());
            } else {
                // Create new variant
                ProductVariant newVariant = new ProductVariant();
                newVariant.setSku(variantRequest.getSku());
                newVariant.setSize(variantRequest.getSize());
                newVariant.setPrice(variantRequest.getPrice());
                newVariant.setStockQuantity(variantRequest.getStockQuantity());
                newVariant.setIsActive(variantRequest.getIsActive());
                newVariant.setProduct(existingProduct);
                updatedVariants.add(newVariant);
            }
        }

        // Variants remaining in the map are to be deleted
        existingProduct.getVariants().clear();
        existingProduct.getVariants().addAll(updatedVariants);
        // --- END REVISED VARIANT MANAGEMENT ---

        Product updatedProduct = productRepository.save(existingProduct);
        log.info("Product after update: {}", updatedProduct);
        return productMapper.toProductDTO(updatedProduct);
    }

    @Override
    @Transactional
    public void deleteProduct(Long productId) {
        Product existingProduct = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        // Delete image from R2
        String imageUrl = existingProduct.getImageUrl();
        log.info("Deleting image from R2. Image URL: {}", imageUrl);
        if (imageUrl != null && !imageUrl.isEmpty()) {
            try {
                java.net.URI uri = new java.net.URI(imageUrl);
                String path = uri.getPath();
                if (path.startsWith("/")) {
                    path = path.substring(1);
                }
                log.info("Extracted object key: {}", path);
                r2Service.deleteObject(path);
            } catch (Exception e) {
                log.error("Error deleting image from R2: {}", e.getMessage());
                // Decide if you want to stop the process or just log the error
            }
        }

        productRepository.delete(existingProduct);
    }

    @Override
    @Transactional
    public ProductDTO updateProductStatus(Long productId, Boolean isActive) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
        product.setIsActive(isActive);
        Product updatedProduct = productRepository.save(product);
        return productMapper.toProductDTO(updatedProduct);
    }
}