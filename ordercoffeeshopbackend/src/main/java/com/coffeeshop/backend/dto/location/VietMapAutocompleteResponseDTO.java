package com.coffeeshop.backend.dto.location;

import lombok.Data;

import java.util.List;

@Data
public class VietMapAutocompleteResponseDTO {
    private List<VietMapSuggestionDTO> suggestions;
}
