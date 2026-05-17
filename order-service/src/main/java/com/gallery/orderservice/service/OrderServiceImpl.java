package com.gallery.orderservice.service;

import com.gallery.orderservice.dto.*;
import com.gallery.orderservice.model.Order;
import com.gallery.orderservice.model.OrderItem;
import com.gallery.orderservice.repository.CartRepository;
import com.gallery.orderservice.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired private OrderRepository orderRepository;
    @Autowired private CartRepository  cartRepository;

    @Override
    @Transactional
    public OrderResponseDTO createOrder(OrderRequestDTO req) {
        if (req.getItems() == null || req.getItems().isEmpty())
            throw new IllegalArgumentException("Order must contain at least one item");
        if (req.getAddress() == null || req.getAddress().isBlank())
            throw new IllegalArgumentException("Shipping address is required");

        Order order = new Order();
        order.setUserId(req.getUserId());
        order.setUserName(req.getUserName());
        order.setShippingFullName(req.getFullName());
        order.setShippingAddress(req.getAddress());
        order.setShippingCity(req.getCity());
        order.setShippingCountry(req.getCountry());
        order.setShippingZip(req.getZip());
        order.setOrderStatus(Order.OrderStatus.PENDING);
        order.setPaymentStatus(Order.PaymentStatus.PENDING);

        for (CartItemDTO dto : req.getItems()) {
            OrderItem item = new OrderItem(
                dto.getProductId(),
                dto.getTitle(),
                dto.getArtist(),
                dto.getImage(),
                dto.getPrice(),
                dto.getQuantity() != null ? dto.getQuantity() : 1
            );
            order.addOrderItem(item);
        }

        order.calculateTotal();
        Order saved = orderRepository.save(order);

        // Очищаем корзину после оформления заказа
        cartRepository.deleteByUserId(req.getUserId());

        return toDto(saved);
    }

    @Override
    public OrderResponseDTO getOrderById(Long id) {
        return toDto(orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found: " + id)));
    }

    @Override
    public List<OrderResponseDTO> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public List<OrderResponseDTO> getAllOrders() {
        return orderRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public OrderResponseDTO updateOrderStatus(Long id, Order.OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found: " + id));
        order.setOrderStatus(status);
        if (status == Order.OrderStatus.DELIVERED) {
            order.setCompletedAt(LocalDateTime.now());
            order.setPaymentStatus(Order.PaymentStatus.PAID);
        }
        return toDto(orderRepository.save(order));
    }

    @Override
    @Transactional
    public OrderResponseDTO cancelOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found: " + id));
        if (order.getOrderStatus() == Order.OrderStatus.DELIVERED)
            throw new RuntimeException("Cannot cancel a delivered order");
        if (order.getOrderStatus() == Order.OrderStatus.CANCELLED)
            throw new RuntimeException("Order is already cancelled");

        order.setOrderStatus(Order.OrderStatus.CANCELLED);
        if (order.getPaymentStatus() == Order.PaymentStatus.PAID) {
            order.setPaymentStatus(Order.PaymentStatus.REFUNDED);
        }
        return toDto(orderRepository.save(order));
    }

    @Override
    public StatsDTO getUserOrderStatistics(Long userId) {
        StatsDTO stats = new StatsDTO();
        stats.setUserId(userId);
        stats.setTotalOrders(orderRepository.countByUserId(userId));
        Double spent = orderRepository.getTotalSpentByUserId(userId);
        stats.setTotalSpent(spent != null ? BigDecimal.valueOf(spent) : BigDecimal.ZERO);
        return stats;
    }

    @Override
    public EarningsDTO getArtistEarnings(String artistName) {
        List<Order> orders = orderRepository.findOrdersByArtistName(artistName);
        Double total = orderRepository.getTotalEarningsByArtistName(artistName);

        EarningsDTO dto = new EarningsDTO();
        dto.setTotalEarned(total != null ? BigDecimal.valueOf(total) : BigDecimal.ZERO);
        dto.setOrdersCount((long) orders.size());

        // Заработок за текущий месяц
        LocalDateTime monthStart = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0);
        BigDecimal monthTotal = orders.stream()
                .filter(o -> o.getCreatedAt().isAfter(monthStart)
                          && o.getPaymentStatus() == Order.PaymentStatus.PAID)
                .flatMap(o -> o.getOrderItems().stream())
                .filter(i -> artistName.equals(i.getArtistName()))
                .map(OrderItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setMonthEarned(monthTotal);

        // Последние продажи
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        List<EarningsDTO.SaleItemDTO> sales = new ArrayList<>();
        for (Order o : orders) {
            o.getOrderItems().stream()
                .filter(i -> artistName.equals(i.getArtistName()))
                .forEach(i -> {
                    EarningsDTO.SaleItemDTO sale = new EarningsDTO.SaleItemDTO();
                    sale.setOrderId(o.getId());
                    sale.setTitle(i.getProductTitle());
                    sale.setAmount(i.getSubtotal());
                    sale.setDate(o.getCreatedAt().format(fmt));
                    sales.add(sale);
                });
        }
        dto.setSales(sales);
        return dto;
    }

    // ── mapper ────────────────────────────────────────────────────────────────

    private OrderResponseDTO toDto(Order o) {
        OrderResponseDTO dto = new OrderResponseDTO();
        dto.setId(o.getId());
        dto.setUserId(o.getUserId());
        dto.setUserName(o.getUserName());
        dto.setTotal(o.getTotalAmount());
        dto.setStatus(o.getOrderStatus().name().toLowerCase());
        dto.setPaymentStatus(o.getPaymentStatus().name().toLowerCase());
        dto.setShippingFullName(o.getShippingFullName());
        dto.setShippingAddress(o.getShippingAddress());
        dto.setShippingCity(o.getShippingCity());
        dto.setShippingCountry(o.getShippingCountry());
        dto.setShippingZip(o.getShippingZip());
        dto.setCreatedAt(o.getCreatedAt());

        List<CartItemDTO> items = o.getOrderItems().stream().map(i -> {
            CartItemDTO item = new CartItemDTO();
            item.setProductId(i.getProductId());
            item.setTitle(i.getProductTitle());
            item.setArtist(i.getArtistName());
            item.setImage(i.getProductImage());
            item.setPrice(i.getUnitPrice());
            item.setQuantity(i.getQuantity());
            item.setSubtotal(i.getSubtotal());
            return item;
        }).collect(Collectors.toList());
        dto.setItems(items);

        return dto;
    }
}
