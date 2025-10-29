package com.coffeeshop.backend.controller;

import com.coffeeshop.backend.service.R2Service;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/r2")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class R2Controller {

    private final R2Service r2Service;

    @PostMapping("/upload-url")
    public ResponseEntity<?> getUploadUrl(@RequestBody Map<String, String> request) {
        String fileName = request.get("fileName");
        String contentType = request.get("contentType");

        if (fileName == null || contentType == null) {
            return ResponseEntity.badRequest().body("fileName and contentType are required");
        }

        try {
            Map<String, String> response = r2Service.generatePresignedUploadUrl(fileName, contentType);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to generate upload URL");
        }
    }
}