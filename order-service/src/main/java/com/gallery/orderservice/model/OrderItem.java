package com.gallery.orderservice.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "product_title", nullable = false)
    private String productTitle;

    @Column(name = "artist_name")
    private String artistName;

    @Column(name = "product_image")
    private String productImage;

    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "quantity", nullable = false)
    private Integer quantity = 1;

    @Column(name = "subtotal", nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    public OrderItem() {}

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

    // Getters and Setters
    public Long getId()                          { return id; }
    public void setId(Long id)                   { this.id = id; }
    public Order getOrder()                      { return order; }
    public void setOrder(Order order)            { this.order = order; }
    public Long getProductId()                   { return productId; }
    public void setProductId(Long v)             { this.productId = v; }
    public String getProductTitle()              { return productTitle; }
    public void setProductTitle(String v)        { this.productTitle = v; }
    public String getArtistName()                { return artistName; }
    public void setArtistName(String v)          { this.artistName = v; }
    public String getProductImage()              { return productImage; }
    public void setProductImage(String v)        { this.productImage = v; }
    public BigDecimal getUnitPrice()             { return unitPrice; }
    public void setUnitPrice(BigDecimal v)       { this.unitPrice = v; }
    public Integer getQuantity()                 { return quantity; }
    public void setQuantity(Integer quantity)    { this.quantity = quantity; }
    public BigDecimal getSubtotal()              { return subtotal; }
    public void setSubtotal(BigDecimal v)        { this.subtotal = v; }
}
