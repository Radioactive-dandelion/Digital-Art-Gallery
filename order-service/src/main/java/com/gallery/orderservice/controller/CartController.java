package com.gallery.orderservice.controller;

import com.gallery.orderservice.dto.CartItemDTO;
import com.gallery.orderservice.service.CartService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
public class CartController {

    @Autowired
    private CartService cartService;

    /** GET /cart */
    @GetMapping("/cart")
    public ResponseEntity<?> getCart(HttpServletRequest req) {
        Long userId = (Long) req.getAttribute("userId");
        return ResponseEntity.ok(cartService.getCart(userId));
    }

    /** POST /cart — добавить товар */
    @PostMapping("/cart")
    public ResponseEntity<?> addToCart(@RequestBody CartItemDTO dto, HttpServletRequest req) {
        try {
            Long userId = (Long) req.getAttribute("userId");
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(cartService.addToCart(userId, dto));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** PUT /cart/{productId} — изменить количество */
    @PutMapping("/cart/{productId}")
    public ResponseEntity<?> updateQuantity(@PathVariable Long productId,
                                            @RequestBody Map<String, Integer> body,
                                            HttpServletRequest req) {
        try {
            Long userId = (Long) req.getAttribute("userId");
            Integer qty = body.get("quantity");
            if (qty == null || qty < 1) {
                return ResponseEntity.badRequest().body(Map.of("error", "quantity must be >= 1"));
            }
            return ResponseEntity.ok(cartService.updateQuantity(userId, productId, qty));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** DELETE /cart/{productId} — удалить позицию */
    @DeleteMapping("/cart/{productId}")
    public ResponseEntity<?> removeFromCart(@PathVariable Long productId, HttpServletRequest req) {
        Long userId = (Long) req.getAttribute("userId");
        cartService.removeFromCart(userId, productId);
        return ResponseEntity.noContent().build();
    }

    /** DELETE /cart — очистить корзину */
    @DeleteMapping("/cart")
    public ResponseEntity<?> clearCart(HttpServletRequest req) {
        Long userId = (Long) req.getAttribute("userId");
        cartService.clearCart(userId);
        return ResponseEntity.noContent().build();
    }
}
