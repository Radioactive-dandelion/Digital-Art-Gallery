package com.gallery.orderservice.controller;

import com.gallery.orderservice.dto.*;
import com.gallery.orderservice.model.Order;
import com.gallery.orderservice.service.OrderService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class OrderController {

    @Autowired
    private OrderService orderService;

    // ── USER: Orders ──────────────────────────────────────────────────────────

    /** GET /orders — заказы текущего пользователя */
    @GetMapping("/orders")
    public ResponseEntity<?> getMyOrders(HttpServletRequest req) {
        try {
            Long userId = (Long) req.getAttribute("userId");
            return ResponseEntity.ok(orderService.getOrdersByUserId(userId));
        } catch (Exception e) {
            return error(e);
        }
    }

    /** GET /orders/{id} */
    @GetMapping("/orders/{id}")
    public ResponseEntity<?> getOrder(@PathVariable Long id, HttpServletRequest req) {
        try {
            Long userId = (Long) req.getAttribute("userId");
            String role = (String) req.getAttribute("userRole");
            OrderResponseDTO order = orderService.getOrderById(id);

            // Пользователь может видеть только свои заказы; admin — любые
            if (!"admin".equals(role) && !order.getUserId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied"));
            }
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    /** POST /orders — создать заказ из корзины */
    @PostMapping("/orders")
    public ResponseEntity<?> createOrder(@Valid @RequestBody OrderRequestDTO request,
                                         HttpServletRequest req) {
        try {
            Long userId   = (Long) req.getAttribute("userId");
            String name   = (String) req.getAttribute("userName");
            request.setUserId(userId);
            request.setUserName(name);
            OrderResponseDTO order = orderService.createOrder(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(order);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return error(e);
        }
    }

    /** POST /orders/{id}/cancel */
    @PostMapping("/orders/{id}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Long id, HttpServletRequest req) {
        try {
            Long userId = (Long) req.getAttribute("userId");
            String role = (String) req.getAttribute("userRole");
            OrderResponseDTO order = orderService.getOrderById(id);

            if (!"admin".equals(role) && !order.getUserId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied"));
            }
            return ResponseEntity.ok(orderService.cancelOrder(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** GET /orders/stats — статистика текущего пользователя */
    @GetMapping("/orders/stats")
    public ResponseEntity<?> getMyStats(HttpServletRequest req) {
        try {
            Long userId = (Long) req.getAttribute("userId");
            return ResponseEntity.ok(orderService.getUserOrderStatistics(userId));
        } catch (Exception e) {
            return error(e);
        }
    }

    // ── ARTIST: Earnings ──────────────────────────────────────────────────────

    /** GET /artist/earnings */
    @GetMapping("/artist/earnings")
    public ResponseEntity<?> getMyEarnings(HttpServletRequest req) {
        try {
            String artistName = (String) req.getAttribute("userName");
            return ResponseEntity.ok(orderService.getArtistEarnings(artistName));
        } catch (Exception e) {
            return error(e);
        }
    }

    // ── ADMIN ─────────────────────────────────────────────────────────────────

    /** GET /admin/orders — все заказы */
    @GetMapping("/admin/orders")
    public ResponseEntity<?> adminGetAllOrders(HttpServletRequest req) {
        try {
            checkAdmin(req);
            return ResponseEntity.ok(orderService.getAllOrders());
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return error(e);
        }
    }

    /** PUT /admin/orders/{id}/status */
    @PutMapping("/admin/orders/{id}/status")
    public ResponseEntity<?> adminUpdateStatus(@PathVariable Long id,
                                               @RequestBody StatusUpdateDTO dto,
                                               HttpServletRequest req) {
        try {
            checkAdmin(req);
            Order.OrderStatus status = Order.OrderStatus.valueOf(dto.getStatus().toUpperCase());
            return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid status: " + dto.getStatus()));
        } catch (Exception e) {
            return error(e);
        }
    }

    // ── INTERNAL ──────────────────────────────────────────────────────────────

    /** GET /internal/orders/user/{userId} — для других сервисов */
    @GetMapping("/internal/orders/user/{userId}")
    public ResponseEntity<?> internalGetUserOrders(@PathVariable Long userId,
                                                   HttpServletRequest req) {
        String secret = req.getHeader("x-internal-secret");
        String expected = System.getenv().getOrDefault("INTERNAL_SECRET", "internal-secret");
        if (!expected.equals(secret)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Forbidden"));
        }
        return ResponseEntity.ok(orderService.getOrdersByUserId(userId));
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private void checkAdmin(HttpServletRequest req) {
        String role = (String) req.getAttribute("userRole");
        if (!"admin".equals(role)) throw new SecurityException("Admins only");
    }

    private ResponseEntity<Map<String, Object>> error(Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
    }
}
