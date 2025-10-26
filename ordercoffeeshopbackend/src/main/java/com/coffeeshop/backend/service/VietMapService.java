package com.coffeeshop.backend.service;

import com.coffeeshop.backend.dto.location.VietmapAddressDTO;

import java.util.List;

import reactor.core.publisher.Mono;

public interface VietMapService {
    Mono<Object> search(String text, Double lat, Double lng);
    Mono<List<VietmapAddressDTO>> autocomplete(String text, String focus);
    Mono<Object> getDetails(String refId);
}