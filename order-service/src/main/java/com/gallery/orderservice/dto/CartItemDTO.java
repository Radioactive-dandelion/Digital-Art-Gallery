package com.gallery.orderservice.dto;

import java.math.BigDecimal;

/** Универсальный DTO для корзины, вишлиста и позиций заказа. */
public class CartItemDTO {

    private Long productId;
    private String title;
    private String artist;
    private String image;
    private BigDecimal price;
    private Integer quantity;
    private BigDecimal subtotal;

    // Getters / Setters
    public Long getProductId()            { return productId; }
    public void setProductId(Long v)      { this.productId = v; }
    public String getTitle()              { return title; }
    public void setTitle(String v)        { this.title = v; }
    public String getArtist()             { return artist; }
    public void setArtist(String v)       { this.artist = v; }
    public String getImage()              { return image; }
    public void setImage(String v)        { this.image = v; }
    public BigDecimal getPrice()          { return price; }
    public void setPrice(BigDecimal v)    { this.price = v; }
    public Integer getQuantity()          { return quantity; }
    public void setQuantity(Integer v)    { this.quantity = v; }
    public BigDecimal getSubtotal()       { return subtotal; }
    public void setSubtotal(BigDecimal v) { this.subtotal = v; }
}
