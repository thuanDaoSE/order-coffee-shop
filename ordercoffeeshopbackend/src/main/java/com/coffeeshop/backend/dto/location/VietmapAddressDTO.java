package com.coffeeshop.backend.dto.location;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;

@Data
public class VietmapAddressDTO {
    @JsonProperty("ref_id")
    private String refId;
    private long distance;
    private String address;
    private String name;
    private String display;
    private List<BoundaryDTO> boundaries;

    @Data
    public static class BoundaryDTO {
        private int type;
        private int id;
        private String name;
        private String prefix;
        @JsonProperty("full_name")
        private String fullName;
    }
}
