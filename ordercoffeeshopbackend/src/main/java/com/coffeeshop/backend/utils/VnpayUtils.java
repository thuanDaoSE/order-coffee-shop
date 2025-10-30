package com.coffeeshop.backend.utils;

import com.coffeeshop.backend.config.VnpayConfig;
import com.coffeeshop.backend.dto.payment.VnpayResponse;
import com.coffeeshop.backend.dto.payment.PaymentInitiationRequest;
import com.coffeeshop.backend.dto.payment.VnpayRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.ObjectInputFilter.Config;
import java.io.UnsupportedEncodingException;
import java.lang.reflect.Field;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.text.SimpleDateFormat;
import java.util.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

@Component
public class VnpayUtils {

    @Autowired
    private VnpayConfig vnpayConfig;

    public String getVnp_HashSecret() {
        return vnpayConfig.getVnp_HashSecret();
    }

    public String createVnpayPaymentUrl(PaymentInitiationRequest paymentInitiationRequest, String clientIp)
            throws UnsupportedEncodingException {
        // amount, orderInfo, vnpayRequest
        long amount = (long) (paymentInitiationRequest.getAmount() * 100);
        String vnp_TxnRef = paymentInitiationRequest.getOrderId(); // Use the actual orderId as the transaction
                                                                   // reference
        // String vnp_IpAddr = "127.0.0.1";
        String vnp_IpAddr = clientIp;
        String vnp_TmnCode = vnpayConfig.getVnp_TmnCode();

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnpayConfig.getVnp_Version());
        vnp_Params.put("vnp_Command", vnpayConfig.getVnp_Command());
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        if (paymentInitiationRequest.getBankCode() != null && !paymentInitiationRequest.getBankCode().isEmpty()) {
            vnp_Params.put("vnp_BankCode", paymentInitiationRequest.getBankCode());
        }
        vnp_Params.put("vnp_CurrCode", "VND");

        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang:" + vnp_TxnRef);
        vnp_Params.put("vnp_OrderType", vnpayConfig.getVnp_OrderType());
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnpayConfig.getVnp_ReturnUrl());

        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

        // Conditionally add vnp_BankCode if it exists
        if (paymentInitiationRequest.getBankCode() != null && !paymentInitiationRequest.getBankCode().isEmpty()) {
            vnp_Params.put("vnp_BankCode", paymentInitiationRequest.getBankCode());
        }

        // Sử dụng java.time API để xử lý múi giờ chính xác
        ZoneId vietnamZone = ZoneId.of("Asia/Ho_Chi_Minh");
        ZonedDateTime nowInVietnam = ZonedDateTime.now(vietnamZone);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

        String vnp_CreateDate = nowInVietnam.format(formatter);
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        String vnp_ExpireDate = nowInVietnam.plusMinutes(15).format(formatter);
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if ((fieldValue != null) && (!fieldValue.isEmpty())) {
                // Build hash data
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8.toString()));
                // Build query
                query.append(URLEncoder.encode(fieldName, StandardCharsets.UTF_8.toString()));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8.toString()));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }
        String queryUrl = query.toString();
        String vnp_SecureHash = VnpayUtils.hmacSHA512(vnpayConfig.getVnp_HashSecret(), hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        String paymentUrl = vnpayConfig.getVnp_Url() + "?" + queryUrl;
        return paymentUrl;
    }

    public boolean isSignatureValid(Map<String, String> vnpayParams) {
        if (vnpayParams == null) {
            return false;
        }
        String receivedHash = vnpayParams.get("vnp_SecureHash");
        if (receivedHash == null || receivedHash.isEmpty()) {
            return false;
        }
        // Create a copy of the map to avoid modifying the original
        Map<String, String> paramsToValidate = new HashMap<>(vnpayParams);

        // Remove hash and hash type fields from the map
        paramsToValidate.remove("vnp_SecureHash");
        paramsToValidate.remove("vnp_SecureHashType");

        // Sort fields alphabetically
        List<String> fieldNames = new ArrayList<>(paramsToValidate.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = paramsToValidate.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                // Build hash data
                hashData.append(fieldName);
                hashData.append('=');
                // URL-encode the value
                try {
                    hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8.toString()));
                } catch (UnsupportedEncodingException e) {
                    // This should not happen with UTF-8
                    throw new RuntimeException(e);
                }
                if (itr.hasNext()) {
                    hashData.append('&');
                }
            }
        }

        String calculatedHash = hmacSHA512(vnpayConfig.getVnp_HashSecret(), hashData.toString());
        return calculatedHash.equals(receivedHash);
    }

    private String getCurrentDateString(String format) {
        return new SimpleDateFormat(format).format(new Date());
    }

    private String getExpireDateString() {
        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.MINUTE, 15);
        return new SimpleDateFormat("yyyyMMddHHmmss").format(cal.getTime());
    }

    // hmacSHA512
    public static String hmacSHA512(String key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(), "HmacSHA512");
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(data.getBytes());
            return bytesToHex(hash);
        } catch (Exception e) {
            throw new RuntimeException("Error generating HMAC SHA-512", e);
        }
    }

    private static String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

}