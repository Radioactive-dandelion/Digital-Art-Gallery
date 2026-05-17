package com.gallery.orderservice.service;

import com.gallery.orderservice.dto.*;
import com.gallery.orderservice.model.Order;

import java.util.List;

public interface OrderService {
    OrderResponseDTO createOrder(OrderRequestDTO request);
    OrderResponseDTO getOrderById(Long id);
    List<OrderResponseDTO> getOrdersByUserId(Long userId);
    List<OrderResponseDTO> getAllOrders();
    OrderResponseDTO updateOrderStatus(Long id, Order.OrderStatus status);
    OrderResponseDTO cancelOrder(Long id);
    StatsDTO getUserOrderStatistics(Long userId);
    EarningsDTO getArtistEarnings(String artistName);
}
