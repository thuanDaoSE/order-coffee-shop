package com.coffeeshop.backend.dto.address;

import lombok.Data;
import java.util.List;

@Data
public class VietMapAutocompleteResponseDTO {
    private String code;
    private String message;
    private List<VietMapPlaceDTO> data;
}
