package com.coffeeshop.backend.service;

import java.util.Map;

public interface R2Service {
    Map<String, String> generatePresignedUploadUrl(String fileName, String contentType);
    void deleteObject(String objectKey);
}
