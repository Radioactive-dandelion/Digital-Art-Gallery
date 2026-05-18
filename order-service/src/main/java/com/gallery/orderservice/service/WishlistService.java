package com.gallery.orderservice.service;

import com.gallery.orderservice.dto.CartItemDTO;
import com.gallery.orderservice.model.WishlistItem;
import com.gallery.orderservice.repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WishlistService {

    @Autowired
    private WishlistRepository wishlistRepository;

    public List<CartItemDTO> getWishlist(Long userId) {
        return wishlistRepository.findByUserId(userId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public CartItemDTO addToWishlist(Long userId, CartItemDTO dto) {
        // Если уже в вишлисте — возвращаем существующий
        return wishlistRepository.findByUserIdAndProductId(userId, dto.getProductId())
                .map(this::toDto)
                .orElseGet(() -> {
                    WishlistItem item = new WishlistItem();
                    item.setUserId(userId);
                    item.setProductId(dto.getProductId());
                    item.setProductTitle(dto.getTitle());
                    item.setArtistName(dto.getArtist());
                    item.setProductImage(dto.getImage());
                    item.setPrice(dto.getPrice());
                    return toDto(wishlistRepository.save(item));
                });
    }

    @Transactional
    public void removeFromWishlist(Long userId, Long productId) {
        wishlistRepository.deleteByUserIdAndProductId(userId, productId);
    }

    private CartItemDTO toDto(WishlistItem item) {
        CartItemDTO dto = new CartItemDTO();
        dto.setProductId(item.getProductId());
        dto.setTitle(item.getProductTitle());
        dto.setArtist(item.getArtistName());
        dto.setImage(item.getProductImage());
        dto.setPrice(item.getPrice());
        return dto;
    }
}
