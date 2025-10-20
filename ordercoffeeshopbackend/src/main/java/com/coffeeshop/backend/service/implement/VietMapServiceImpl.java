package com.coffeeshop.backend.service.implement;

import com.coffeeshop.backend.dto.location.VietmapAddressDTO;
import com.coffeeshop.backend.service.VietMapService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;

@Service
public class VietMapServiceImpl implements VietMapService {

    private final WebClient webClient;
    private final String apiKey;
    private final Logger logger = LoggerFactory.getLogger(VietMapServiceImpl.class);

    public VietMapServiceImpl(WebClient.Builder webClientBuilder,
            @Value("${vietmap.url-base}") String baseUrl,
            @Value("${vietmap.api-key}") String apiKey) {
        this.webClient = webClientBuilder.baseUrl(baseUrl).build();
        this.apiKey = apiKey;
    }

    @Override
    public Mono<Object> search(String text, Double lat, Double lng) {
        // The VietMap Search API v4 documentation is not explicit about lat/lng
        // focusing.
        // We will perform the search based on the text query only to ensure stability.
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/search/v4")
                        .queryParam("apikey", apiKey)
                        .queryParam("text", text)
                        .build())
                .retrieve()
                .bodyToMono(Object.class);
    }


    @Override
    public Mono<List<VietmapAddressDTO>> autocomplete(String text, String focus) {
        return webClient.get()
        .uri(uriBuilder -> {
            uriBuilder.path("/autocomplete/v4")
            .queryParam("apikey", apiKey)
            .queryParam("text", text)
            .queryParam("layers", "address")
            .queryParam("display_type", 1);
            if (focus != null && !focus.isEmpty()) {
                // The documentation is not clear on the format, but "lat,lng" is common.
                uriBuilder.queryParam("focus", focus);
            }
            logger.info("Autocomplete called with url: " + uriBuilder.build().toString());
                    return uriBuilder.build();
                })
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<VietmapAddressDTO>>() {});
    }

    @Override
    public Mono<Object> getDetails(String refId) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/place/v4")
                        .queryParam("apikey", apiKey)
                        .queryParam("refid", refId)
                        .build())
                .retrieve()
                .bodyToMono(Object.class);
    }
}
