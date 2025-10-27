package com.coffeeshop.backend.mapper;

import org.mapstruct.Mapper;

import com.coffeeshop.backend.dto.product.ProductDTO;
import com.coffeeshop.backend.entity.Product;
import com.coffeeshop.backend.dto.category.CategoryDTO;
import com.coffeeshop.backend.entity.Category;

import com.coffeeshop.backend.dto.category.CategoryDTO;
import com.coffeeshop.backend.entity.Category;

@Mapper(componentModel = "spring", uses = {CategoryMapper.class})
public interface ProductMapper {

    ProductDTO toProductDTO(Product product);

    Product toProduct(ProductDTO productDTO);

}
