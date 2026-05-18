// ── OrderRequestDTO.java ──────────────────────────────────────────────────────
package com.gallery.orderservice.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class OrderRequestDTO {

    private Long userId;       // заполняется из JWT в контроллере
    private String userName;   // заполняется из JWT в контроллере

    @NotEmpty(message = "Order items are required")
    private List<CartItemDTO> items;

    private String fullName;
    private String email;

    @NotEmpty(message = "Address is required")
    private String address;

    @NotEmpty(message = "City is required")
    private String city;

    @NotEmpty(message = "Country is required")
    private String country;

    private String zip;

    // Getters / Setters
    public Long getUserId()               { return userId; }
    public void setUserId(Long v)         { this.userId = v; }
    public String getUserName()           { return userName; }
    public void setUserName(String v)     { this.userName = v; }
    public List<CartItemDTO> getItems()   { return items; }
    public void setItems(List<CartItemDTO> v) { this.items = v; }
    public String getFullName()           { return fullName; }
    public void setFullName(String v)     { this.fullName = v; }
    public String getEmail()              { return email; }
    public void setEmail(String v)        { this.email = v; }
    public String getAddress()            { return address; }
    public void setAddress(String v)      { this.address = v; }
    public String getCity()              { return city; }
    public void setCity(String v)        { this.city = v; }
    public String getCountry()           { return country; }
    public void setCountry(String v)     { this.country = v; }
    public String getZip()              { return zip; }
    public void setZip(String v)        { this.zip = v; }
}
