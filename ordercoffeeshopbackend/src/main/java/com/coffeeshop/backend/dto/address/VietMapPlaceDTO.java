package com.coffeeshop.backend.dto.address;

import lombok.Data;
import java.util.List;

@Data
public class VietMapPlaceDTO {
    private String refId;
    private Double distance;
    private String address;
    private String name;
    private String display;
    private List<VietMapBoundaryDTO> boundaries;
    private List<String> categories;
    private List<VietMapEntryPointDTO> entryPoints;
    
    /**
     * Old-format variant of this result (when applicable to the chosen display type)
     * Contains 3-level administrative boundaries (ward, district, city)
     */
    private VietMapPlaceDTO dataOld;
    
    /**
     * New-format variant of this result (when applicable to the chosen display type)
     * Contains 2-level administrative boundaries (ward, city)
     */
    private VietMapPlaceDTO dataNew;
}
