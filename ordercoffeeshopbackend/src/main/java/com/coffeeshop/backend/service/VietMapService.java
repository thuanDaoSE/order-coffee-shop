package com.coffeeshop.backend.service;

import com.coffeeshop.backend.dto.location.VietmapAddressDTO;
import reactor.core.publisher.Mono;

import java.util.List;

public interface VietMapService {
    Mono<Object> search(String text, Double lat, Double lng);
    Mono<List<VietmapAddressDTO>> autocomplete(String text, String focus);
    Mono<Object> getDetails(String refId);
}