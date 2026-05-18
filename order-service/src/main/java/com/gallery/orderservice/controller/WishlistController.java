package com.gallery.orderservice.controller;

import com.gallery.orderservice.dto.CartItemDTO;
import com.gallery.orderservice.service.WishlistService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;

    /** GET /wishlist */
    @GetMapping("/wishlist")
    public ResponseEntity<?> getWishlist(HttpServletRequest req) {
        Long userId = (Long) req.getAttribute("userId");
        return ResponseEntity.ok(wishlistService.getWishlist(userId));
    }

    /** POST /wishlist — добавить в избранное */
    @PostMapping("/wishlist")
    public ResponseEntity<?> addToWishlist(@RequestBody CartItemDTO dto, HttpServletRequest req) {
        try {
            Long userId = (Long) req.getAttribute("userId");
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(wishlistService.addToWishlist(userId, dto));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** DELETE /wishlist/{productId} — убрать из избранного */
    @DeleteMapping("/wishlist/{productId}")
    public ResponseEntity<?> removeFromWishlist(@PathVariable Long productId,
                                                HttpServletRequest req) {
        Long userId = (Long) req.getAttribute("userId");
        wishlistService.removeFromWishlist(userId, productId);
        return ResponseEntity.noContent().build();
    }
}
