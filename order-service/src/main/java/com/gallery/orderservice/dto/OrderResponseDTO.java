package com.gallery.orderservice.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderResponseDTO {

    private Long id;
    private Long userId;
    private String userName;
    private List<CartItemDTO> items;
    private BigDecimal total;
    private String status;
    private String paymentStatus;
    private String shippingFullName;
    private String shippingAddress;
    private String shippingCity;
    private String shippingCountry;
    private String shippingZip;
    private LocalDateTime createdAt;

    // Getters / Setters
    public Long getId()                      { return id; }
    public void setId(Long v)               { this.id = v; }
    public Long getUserId()                  { return userId; }
    public void setUserId(Long v)           { this.userId = v; }
    public String getUserName()              { return userName; }
    public void setUserName(String v)       { this.userName = v; }
    public List<CartItemDTO> getItems()      { return items; }
    public void setItems(List<CartItemDTO> v){ this.items = v; }
    public BigDecimal getTotal()             { return total; }
    public void setTotal(BigDecimal v)      { this.total = v; }
    public String getStatus()               { return status; }
    public void setStatus(String v)         { this.status = v; }
    public String getPaymentStatus()         { return paymentStatus; }
    public void setPaymentStatus(String v)  { this.paymentStatus = v; }
    public String getShippingFullName()      { return shippingFullName; }
    public void setShippingFullName(String v){ this.shippingFullName = v; }
    public String getShippingAddress()       { return shippingAddress; }
    public void setShippingAddress(String v){ this.shippingAddress = v; }
    public String getShippingCity()          { return shippingCity; }
    public void setShippingCity(String v)   { this.shippingCity = v; }
    public String getShippingCountry()       { return shippingCountry; }
    public void setShippingCountry(String v){ this.shippingCountry = v; }
    public String getShippingZip()           { return shippingZip; }
    public void setShippingZip(String v)    { this.shippingZip = v; }
    public LocalDateTime getCreatedAt()      { return createdAt; }
    public void setCreatedAt(LocalDateTime v){ this.createdAt = v; }
}
