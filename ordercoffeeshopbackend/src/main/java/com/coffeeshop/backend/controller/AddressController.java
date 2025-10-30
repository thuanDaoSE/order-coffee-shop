package com.coffeeshop.backend.controller;

import com.coffeeshop.backend.dto.address.AddressDTO;
import com.coffeeshop.backend.service.AddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    public ResponseEntity<List<AddressDTO>> getUserAddresses(@AuthenticationPrincipal UserDetails userDetails) {
        List<AddressDTO> addresses = addressService.getUserAddresses(userDetails.getUsername());
        return ResponseEntity.ok(addresses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AddressDTO> getAddressById(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        AddressDTO address = addressService.getAddressById(id, userDetails.getUsername());
        return ResponseEntity.ok(address);
    }

    @PostMapping
    public ResponseEntity<AddressDTO> createAddress(@RequestBody AddressDTO addressDTO, @AuthenticationPrincipal UserDetails userDetails) {
        AddressDTO createdAddress = addressService.createAddress(addressDTO, userDetails.getUsername());
        return new ResponseEntity<>(createdAddress, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AddressDTO> updateAddress(@PathVariable Long id, @RequestBody AddressDTO addressDTO, @AuthenticationPrincipal UserDetails userDetails) {
        AddressDTO updatedAddress = addressService.updateAddress(id, addressDTO, userDetails.getUsername());
        return ResponseEntity.ok(updatedAddress);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAddress(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        addressService.deleteAddress(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/default")
    public ResponseEntity<AddressDTO> setDefaultAddress(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        AddressDTO defaultAddress = addressService.setDefaultAddress(id, userDetails.getUsername());
        return ResponseEntity.ok(defaultAddress);
    }

    @GetMapping("/default")
    public ResponseEntity<AddressDTO> getDefaultAddress(@AuthenticationPrincipal UserDetails userDetails) {
        AddressDTO defaultAddress = addressService.getDefaultAddress(userDetails.getUsername());
        return ResponseEntity.ok(defaultAddress);
    }
}
