package com.gallery.orderservice.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "wishlist_items",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "product_id"}))
public class WishlistItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "product_title")
    private String productTitle;

    @Column(name = "artist_name")
    private String artistName;

    @Column(name = "product_image")
    private String productImage;

    @Column(name = "price", precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "added_at", updatable = false)
    private LocalDateTime addedAt;

    @PrePersist
    protected void onCreate() {
        addedAt = LocalDateTime.now();
    }

    public Long getId()                        { return id; }
    public void setId(Long id)                 { this.id = id; }
    public Long getUserId()                    { return userId; }
    public void setUserId(Long userId)         { this.userId = userId; }
    public Long getProductId()                 { return productId; }
    public void setProductId(Long productId)   { this.productId = productId; }
    public String getProductTitle()            { return productTitle; }
    public void setProductTitle(String v)      { this.productTitle = v; }
    public String getArtistName()              { return artistName; }
    public void setArtistName(String v)        { this.artistName = v; }
    public String getProductImage()            { return productImage; }
    public void setProductImage(String v)      { this.productImage = v; }
    public BigDecimal getPrice()               { return price; }
    public void setPrice(BigDecimal price)     { this.price = price; }
    public LocalDateTime getAddedAt()          { return addedAt; }
}
