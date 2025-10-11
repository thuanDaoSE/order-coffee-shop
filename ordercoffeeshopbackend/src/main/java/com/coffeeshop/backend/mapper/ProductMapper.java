package com.coffeeshop.backend.mapper;

import org.mapstruct.Mapper;

import com.coffeeshop.backend.dto.common.ProductDTO;
import com.coffeeshop.backend.entity.Product;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    ProductDTO toProductDTO(Product product);

    Product toProduct(ProductDTO productDTO);

}
