package com.gallery.orderservice.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "user_name")
    private String userName;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> orderItems = new ArrayList<>();

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_status", nullable = false)
    private OrderStatus orderStatus = OrderStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(name = "shipping_full_name")
    private String shippingFullName;

    @Column(name = "shipping_address")
    private String shippingAddress;

    @Column(name = "shipping_city")
    private String shippingCity;

    @Column(name = "shipping_country")
    private String shippingCountry;

    @Column(name = "shipping_zip")
    private String shippingZip;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    public enum OrderStatus {
        PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED
    }

    public enum PaymentStatus {
        PENDING, PAID, FAILED, REFUNDED
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void addOrderItem(OrderItem item) {
        orderItems.add(item);
        item.setOrder(this);
    }

    public void calculateTotal() {
        this.totalAmount = orderItems.stream()
                .map(OrderItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // Getters and Setters
    public Long getId()                              { return id; }
    public void setId(Long id)                       { this.id = id; }
    public Long getUserId()                          { return userId; }
    public void setUserId(Long userId)               { this.userId = userId; }
    public String getUserName()                      { return userName; }
    public void setUserName(String userName)         { this.userName = userName; }
    public List<OrderItem> getOrderItems()           { return orderItems; }
    public void setOrderItems(List<OrderItem> items) { this.orderItems = items; }
    public BigDecimal getTotalAmount()               { return totalAmount; }
    public void setTotalAmount(BigDecimal v)         { this.totalAmount = v; }
    public OrderStatus getOrderStatus()              { return orderStatus; }
    public void setOrderStatus(OrderStatus v)        { this.orderStatus = v; }
    public PaymentStatus getPaymentStatus()          { return paymentStatus; }
    public void setPaymentStatus(PaymentStatus v)    { this.paymentStatus = v; }
    public String getPaymentMethod()                 { return paymentMethod; }
    public void setPaymentMethod(String v)           { this.paymentMethod = v; }
    public String getShippingFullName()              { return shippingFullName; }
    public void setShippingFullName(String v)        { this.shippingFullName = v; }
    public String getShippingAddress()               { return shippingAddress; }
    public void setShippingAddress(String v)         { this.shippingAddress = v; }
    public String getShippingCity()                  { return shippingCity; }
    public void setShippingCity(String v)            { this.shippingCity = v; }
    public String getShippingCountry()               { return shippingCountry; }
    public void setShippingCountry(String v)         { this.shippingCountry = v; }
    public String getShippingZip()                   { return shippingZip; }
    public void setShippingZip(String v)             { this.shippingZip = v; }
    public LocalDateTime getCreatedAt()              { return createdAt; }
    public void setCreatedAt(LocalDateTime v)        { this.createdAt = v; }
    public LocalDateTime getUpdatedAt()              { return updatedAt; }
    public void setUpdatedAt(LocalDateTime v)        { this.updatedAt = v; }
    public LocalDateTime getCompletedAt()            { return completedAt; }
    public void setCompletedAt(LocalDateTime v)      { this.completedAt = v; }
}
