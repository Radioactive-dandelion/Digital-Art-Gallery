package com.gallery.orderservice.dto;

import java.math.BigDecimal;

public class StatsDTO {
    private Long userId;
    private Long totalOrders;
    private BigDecimal totalSpent;

    public Long getUserId()               { return userId; }
    public void setUserId(Long v)        { this.userId = v; }
    public Long getTotalOrders()          { return totalOrders; }
    public void setTotalOrders(Long v)   { this.totalOrders = v; }
    public BigDecimal getTotalSpent()     { return totalSpent; }
    public void setTotalSpent(BigDecimal v){ this.totalSpent = v; }
}
