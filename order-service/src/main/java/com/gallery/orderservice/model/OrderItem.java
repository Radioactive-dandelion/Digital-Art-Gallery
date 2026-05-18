package com.gallery.orderservice.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Data
@NoArgsConstructor
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    // Денормализованные поля — сохраняем снапшот цены и названия на момент заказа
    @Column(name = "product_title", nullable = false)
    private String productTitle;

    @Column(name = "artist_name")
    private String artistName;

    @Column(name = "product_image")
    private String productImage;

    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    // Для цифрового арта quantity всегда 1, но оставляем поле для гибкости
    @Column(name = "quantity", nullable = false)
    private Integer quantity = 1;

    @Column(name = "subtotal", nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    public OrderItem(Long productId, String productTitle, String artistName,
                     String productImage, BigDecimal unitPrice, Integer quantity) {
        this.productId    = productId;
        this.productTitle = productTitle;
        this.artistName   = artistName;
        this.productImage = productImage;
        this.unitPrice    = unitPrice;
        this.quantity     = quantity;
        calculateSubtotal();
    }

    public void calculateSubtotal() {
        if (unitPrice != null && quantity != null) {
            this.subtotal = unitPrice.multiply(BigDecimal.valueOf(quantity));
        }
    }

    @PrePersist
    @PreUpdate
    protected void onSave() {
        calculateSubtotal();
    }
}
