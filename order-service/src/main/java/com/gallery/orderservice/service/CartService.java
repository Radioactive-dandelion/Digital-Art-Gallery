package com.gallery.orderservice.service;

import com.gallery.orderservice.dto.CartItemDTO;
import com.gallery.orderservice.model.CartItem;
import com.gallery.orderservice.repository.CartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    public List<CartItemDTO> getCart(Long userId) {
        return cartRepository.findByUserId(userId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public CartItemDTO addToCart(Long userId, CartItemDTO dto) {
        Optional<CartItem> existing = cartRepository.findByUserIdAndProductId(userId, dto.getProductId());

        CartItem item;
        if (existing.isPresent()) {
            // Увеличиваем количество если уже в корзине
            item = existing.get();
            item.setQuantity(item.getQuantity() + (dto.getQuantity() != null ? dto.getQuantity() : 1));
        } else {
            item = new CartItem();
            item.setUserId(userId);
            item.setProductId(dto.getProductId());
            item.setProductTitle(dto.getTitle());
            item.setArtistName(dto.getArtist());
            item.setProductImage(dto.getImage());
            item.setPrice(dto.getPrice());
            item.setQuantity(dto.getQuantity() != null ? dto.getQuantity() : 1);
        }

        return toDto(cartRepository.save(item));
    }

    @Transactional
    public CartItemDTO updateQuantity(Long userId, Long productId, Integer qty) {
        CartItem item = cartRepository.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> new RuntimeException("Item not found in cart"));
        item.setQuantity(qty);
        return toDto(cartRepository.save(item));
    }

    @Transactional
    public void removeFromCart(Long userId, Long productId) {
        cartRepository.findByUserIdAndProductId(userId, productId)
                .ifPresent(cartRepository::delete);
    }

    @Transactional
    public void clearCart(Long userId) {
        cartRepository.deleteByUserId(userId);
    }

    private CartItemDTO toDto(CartItem item) {
        CartItemDTO dto = new CartItemDTO();
        dto.setProductId(item.getProductId());
        dto.setTitle(item.getProductTitle());
        dto.setArtist(item.getArtistName());
        dto.setImage(item.getProductImage());
        dto.setPrice(item.getPrice());
        dto.setQuantity(item.getQuantity());
        if (item.getPrice() != null && item.getQuantity() != null) {
            dto.setSubtotal(item.getPrice().multiply(java.math.BigDecimal.valueOf(item.getQuantity())));
        }
        return dto;
    }
}
