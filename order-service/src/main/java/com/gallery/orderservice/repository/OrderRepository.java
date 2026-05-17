package com.gallery.orderservice.repository;

import com.gallery.orderservice.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Order> findByOrderStatus(Order.OrderStatus status);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.userId = :userId")
    Long countByUserId(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.userId = :userId AND o.paymentStatus = 'PAID'")
    Double getTotalSpentByUserId(@Param("userId") Long userId);

    // Для MyEarnings — продажи конкретного артиста
    @Query("SELECT o FROM Order o JOIN o.orderItems i WHERE i.artistName = :artistName ORDER BY o.createdAt DESC")
    List<Order> findOrdersByArtistName(@Param("artistName") String artistName);

    @Query("SELECT COALESCE(SUM(i.subtotal), 0) FROM OrderItem i JOIN i.order o " +
           "WHERE i.artistName = :artistName AND o.paymentStatus = 'PAID'")
    Double getTotalEarningsByArtistName(@Param("artistName") String artistName);
}
