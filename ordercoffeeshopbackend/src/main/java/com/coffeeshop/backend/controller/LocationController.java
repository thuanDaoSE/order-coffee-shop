
package com.coffeeshop.backend.controller;

import com.coffeeshop.backend.dto.location.VietmapAddressDTO;
import com.coffeeshop.backend.service.VietMapService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.List;

@RestController
@RequestMapping("/api/v1/location")
@RequiredArgsConstructor
public class LocationController {

    private final VietMapService vietMapService;

    @GetMapping("/search")
    public Mono<ResponseEntity<?>> search(
            @RequestParam("query") String query,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng) {
        return vietMapService.search(query, lat, lng)
                .map(ResponseEntity::ok);
    }

    @GetMapping("/autocomplete")
    public Mono<ResponseEntity<List<VietmapAddressDTO>>> autocomplete(
            @RequestParam("text") String text,
            @RequestParam(required = false) String focus) {
        return vietMapService.autocomplete(text, focus)
                .map(ResponseEntity::ok);
    }

    @GetMapping("/details")
    public Mono<ResponseEntity<?>> getDetails(@RequestParam("refId") String refId) {
        return vietMapService.getDetails(refId)
                .map(ResponseEntity::ok);
    }
}
