package com.coffeeshop.backend.dto.location;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class VietMapSuggestionDTO {
    private String text;
    private Double latitude;
    private Double longitude;
    @JsonProperty("full_address")
    private String fullAddress;
    @JsonProperty("display_name")
    private String displayName;
}
