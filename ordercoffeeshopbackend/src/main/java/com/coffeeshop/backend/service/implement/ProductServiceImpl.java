package com.coffeeshop.backend.service.implement;

import java.util.List;
import java.util.Optional;

import com.coffeeshop.backend.dto.common.ProductDTO;
import com.coffeeshop.backend.entity.Product;
import com.coffeeshop.backend.mapper.ProductMapper;
import com.coffeeshop.backend.service.ProductService;
import com.coffeeshop.backend.repository.ProductRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    @Override
    public List<ProductDTO> getAllProducts() {
        List<ProductDTO> products = productRepository.findAll()
                .stream()
                .map(product -> {
                    ProductDTO dto = productMapper.toProductDTO(product);
                    return dto;
                }).toList();
        return products;
    }

    @Override
    public List<ProductDTO> getProductsByCategory(String categoryName) {
        return null;
    }

    @Override
    public ProductDTO getProductById(Long productId) {
        return null;
    }

    @Override
    public ProductDTO createProduct(Product product) {
        productRepository.save(product);
        return productMapper.toProductDTO(product);
    }

    @Override
    public ProductDTO updateProduct(Long productId, Product updateProduct) {
        Optional<Product> optionalProduct = productRepository.findById(productId);

        if (!optionalProduct.isPresent()) {
            throw new RuntimeException("Product not found with id: " + productId);
        }

        Product existingProduct = optionalProduct.get();
        existingProduct.setName(updateProduct.getName());
        existingProduct.setPrice(updateProduct.getPrice());
        existingProduct.setDescription(updateProduct.getDescription());
        existingProduct.setImageUrl(updateProduct.getImageUrl());
        existingProduct.setCategory(updateProduct.getCategory());
        productRepository.save(existingProduct);

        return productMapper.toProductDTO(existingProduct);
    }

    @Override
    public ProductDTO deleteProduct(Long productId) {
        return null;
    }

}