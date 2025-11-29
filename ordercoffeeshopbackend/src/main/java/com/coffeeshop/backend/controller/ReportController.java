package com.coffeeshop.backend.controller;

import com.coffeeshop.backend.dto.report.SalesReportDTO;
import com.coffeeshop.backend.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/sales")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SalesReportDTO> getSalesReport(@RequestParam(defaultValue = "weekly") String period,
                                                       @RequestParam(required = false) Long storeId) {
        SalesReportDTO report = reportService.getSalesReport(period, storeId);
        return ResponseEntity.ok(report);
    }
}
