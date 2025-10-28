package com.coffeeshop.backend.service.implement;

import com.coffeeshop.backend.dto.report.SalesReportDTO;
import com.coffeeshop.backend.entity.Order;
import com.coffeeshop.backend.entity.OrderDetail;
import com.coffeeshop.backend.repository.OrderDetailRepository;
import com.coffeeshop.backend.repository.OrderRepository;
import com.coffeeshop.backend.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;

    @Override
    public SalesReportDTO getSalesReport(String period) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startDate;

        switch (period.toLowerCase()) {
            case "daily":
                startDate = now.toLocalDate().atStartOfDay();
                break;
            case "weekly":
                startDate = now.toLocalDate().minusDays(now.getDayOfWeek().getValue() - 1).atStartOfDay();
                break;
            case "monthly":
                startDate = now.toLocalDate().withDayOfMonth(1).atStartOfDay();
                break;
            default:
                throw new IllegalArgumentException("Invalid period: " + period);
        }

        List<Order> orders = orderRepository.findAllByOrderDateBetween(startDate, now);

        BigDecimal totalRevenue = orders.stream()
                .map(Order::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalOrders = orders.size();

        List<Map<String, Object>> revenueOverTime = orders.stream()
                .collect(Collectors.groupingBy(order -> order.getOrderDate().toLocalDate(),
                        Collectors.reducing(BigDecimal.ZERO, Order::getTotalPrice, BigDecimal::add)))
                .entrySet().stream()
                .map(entry -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("date", entry.getKey().toString());
                    map.put("revenue", entry.getValue());
                    return map;
                })
                .collect(Collectors.toList());


        List<Map<String, Object>> topSellingProducts = orderDetailRepository.findAll().stream()
                .collect(Collectors.groupingBy(od -> od.getProductVariant().getProduct().getName(),
                        Collectors.summarizingInt(OrderDetail::getQuantity)))
                .entrySet().stream()
                .map(entry -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("name", entry.getKey());
                    map.put("quantity", entry.getValue().getSum());
                    map.put("revenue", orderDetailRepository.findAll().stream()
                            .filter(od -> od.getProductVariant().getProduct().getName().equals(entry.getKey()))
                            .map(od -> od.getUnitPrice().multiply(new BigDecimal(od.getQuantity())))
                            .reduce(BigDecimal.ZERO, BigDecimal::add));
                    return map;
                })
                .sorted((a, b) -> Long.compare((long) b.get("quantity"), (long) a.get("quantity")))
                .limit(5)
                .collect(Collectors.toList());


        SalesReportDTO report = new SalesReportDTO();
        report.setTotalRevenue(totalRevenue);
        report.setTotalOrders(totalOrders);
        report.setRevenueOverTime(revenueOverTime);
        report.setTopSellingProducts(topSellingProducts);

        return report;
    }
}
