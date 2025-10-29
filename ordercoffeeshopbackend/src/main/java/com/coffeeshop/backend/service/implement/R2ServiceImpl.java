package com.coffeeshop.backend.service.implement;

import com.coffeeshop.backend.service.R2Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;

import java.net.URI;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Service
public class R2ServiceImpl implements R2Service {

    @Value("${r2.accessKey}")
    private String accessKeyId;

    @Value("${r2.secretKey}")
    private String secretAccessKey;

    @Value("${r2.bucketName}")
    private String bucketName;

    @Value("${r2.baseUrl}")
    private String baseUrl;

    @Override
    public Map<String, String> generatePresignedUploadUrl(String fileName, String contentType) {
        S3Presigner presigner = S3Presigner.builder()
                .region(Region.US_EAST_1) // R2 uses a single region, often us-east-1 or auto
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKeyId, secretAccessKey)
                ))
                .endpointOverride(URI.create(baseUrl))
                .build();

        String objectKey = "products/" + fileName;

        PutObjectRequest objectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(objectKey)
                .contentType(contentType)
                .build();

        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(10)) // URL expires in 10 minutes
                .putObjectRequest(objectRequest)
                .build();

        PresignedPutObjectRequest presignedRequest = presigner.presignPutObject(presignRequest);

        Map<String, String> response = new HashMap<>();
        response.put("url", presignedRequest.url().toString());
        response.put("key", objectKey); // The key is the fileName in R2
        presigner.close();
        return response;
    }

    @Override
    public void deleteObject(String objectKey) {
        S3Client s3Client = S3Client.builder()
                .region(Region.US_EAST_1)
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKeyId, secretAccessKey)
                ))
                .endpointOverride(URI.create(baseUrl))
                .build();

        DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(objectKey)
                .build();

        s3Client.deleteObject(deleteObjectRequest);
        s3Client.close();
    }
}
