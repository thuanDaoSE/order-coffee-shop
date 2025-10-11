package com.coffeeshop.backend.controllers;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.net.URI;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/r2")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class R2Controller {

    @Value("${r2.accountId}")
    private String accountId;

    @Value("${r2.accessKey}")
    private String accessKey;

    @Value("${r2.secretKey}")
    private String secretKey;

    @Value("${r2.bucketName}")
    private String bucketName;

    private S3Presigner getPresigner() {
        return S3Presigner.builder()
                .region(Region.US_EAST_1)
                .endpointOverride(URI.create(String.format("https://%s.r2.cloudflarestorage.com", accountId)))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)))
                .build();
    }

    @GetMapping("/signed-url")
    public ResponseEntity<?> getSignedUrl(@RequestParam String key) {
        try {
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofHours(1))
                    .getObjectRequest(getObjectRequest)
                    .build();

            String presignedUrl = getPresigner().presignGetObject(presignRequest).url().toString();

            Map<String, String> response = new HashMap<>();
            response.put("url", presignedUrl);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to generate signed URL");
        }
    }

    @PostMapping("/upload-url")
    public ResponseEntity<?> getUploadUrl(@RequestBody Map<String, String> request) {
        String fileName = request.get("fileName");
        String contentType = request.get("contentType");

        if (fileName == null || contentType == null) {
            return ResponseEntity.badRequest().body("fileName and contentType are required");
        }

        try {
            String key = System.currentTimeMillis() + "-" + fileName;

            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(contentType)
                    .build();

            PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofHours(1))
                    .putObjectRequest(putObjectRequest)
                    .build();

            String presignedUrl = getPresigner().presignPutObject(presignRequest).url().toString();

            Map<String, String> response = new HashMap<>();
            response.put("url", presignedUrl);
            response.put("key", key);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to generate upload URL");
        }
    }
}