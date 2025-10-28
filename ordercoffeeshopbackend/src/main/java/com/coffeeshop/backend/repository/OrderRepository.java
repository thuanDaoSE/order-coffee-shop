package com.coffeeshop.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.coffeeshop.backend.entity.Order;
import java.util.List;

import java.time.LocalDateTime;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findAllByUserId(Long userId);
    List<Order> findAllByOrderDateBetween(LocalDateTime startDate, LocalDateTime endDate);
}
