package com.coffeeshop.backend.service.implement;

import com.coffeeshop.backend.entity.Category;
import com.coffeeshop.backend.repository.CategoryRepository;
import com.coffeeshop.backend.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    public Category createCategory(String categoryName) {
        Category newCategory = new Category();
        newCategory.setName(categoryName);
        newCategory.setSlug(categoryName.toLowerCase().replaceAll("\\s+", "-"));
        newCategory.setImage("logo.png");
        return categoryRepository.save(newCategory);
    }
}
