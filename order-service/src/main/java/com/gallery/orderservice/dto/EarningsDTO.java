package com.gallery.orderservice.dto;

import java.math.BigDecimal;
import java.util.List;

public class EarningsDTO {

    private BigDecimal totalEarned;
    private BigDecimal monthEarned;
    private Long ordersCount;
    private List<SaleItemDTO> sales;

    public BigDecimal getTotalEarned()         { return totalEarned; }
    public void setTotalEarned(BigDecimal v)   { this.totalEarned = v; }
    public BigDecimal getMonthEarned()         { return monthEarned; }
    public void setMonthEarned(BigDecimal v)   { this.monthEarned = v; }
    public Long getOrdersCount()               { return ordersCount; }
    public void setOrdersCount(Long v)         { this.ordersCount = v; }
    public List<SaleItemDTO> getSales()        { return sales; }
    public void setSales(List<SaleItemDTO> v)  { this.sales = v; }

    public static class SaleItemDTO {
        private Long orderId;
        private String title;
        private BigDecimal amount;
        private String date;

        public Long getOrderId()             { return orderId; }
        public void setOrderId(Long v)       { this.orderId = v; }
        public String getTitle()             { return title; }
        public void setTitle(String v)       { this.title = v; }
        public BigDecimal getAmount()        { return amount; }
        public void setAmount(BigDecimal v)  { this.amount = v; }
        public String getDate()              { return date; }
        public void setDate(String v)        { this.date = v; }
    }
}
