package com.coffeeshop.backend.service.impl;

import com.coffeeshop.backend.dto.StoreDTO;
import com.coffeeshop.backend.entity.Store;
import com.coffeeshop.backend.repository.StoreRepository;
import com.coffeeshop.backend.service.StoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StoreServiceImpl implements StoreService {

    @Autowired
    private StoreRepository storeRepository;

    @Override
    public List<StoreDTO> getAllActiveStores() {
        return storeRepository.findAllByIsActive(true).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private StoreDTO convertToDTO(Store store) {
        StoreDTO storeDTO = new StoreDTO();
        storeDTO.setId(store.getId());
        storeDTO.setName(store.getName());
        storeDTO.setAddress(store.getAddress());
        return storeDTO;
    }
}
