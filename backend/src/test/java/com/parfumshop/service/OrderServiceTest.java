package com.parfumshop.service;

import com.parfumshop.entity.Order;
import com.parfumshop.entity.OrderItem;
import com.parfumshop.entity.Product;
import com.parfumshop.enums.OrderStatus;
import com.parfumshop.repository.OrderRepository;
import com.parfumshop.repository.ProductRepository;
import com.parfumshop.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private UserRepository userRepository;

    private OrderService orderService;

    @BeforeEach
    void setUp() {
        orderService = new OrderService(orderRepository, productRepository, userRepository);
    }

    @Test
    void confirmsPendingOrderAfterSuccessfulStripePayment() {
        Order order = Order.builder()
                .status(OrderStatus.PENDING)
                .items(List.of())
                .build();
        when(orderRepository.findByStripePaymentIntentIdForUpdate("pi_test"))
                .thenReturn(Optional.of(order));

        orderService.confirmPayment("pi_test");

        assertThat(order.getStatus()).isEqualTo(OrderStatus.CONFIRMED);
    }

    @Test
    void restoresStockWhenStripeCancelsPendingPayment() {
        Product product = Product.builder()
                .id(10L)
                .stockQuantity(3)
                .active(true)
                .build();
        OrderItem item = OrderItem.builder()
                .product(product)
                .quantity(2)
                .build();
        Order order = Order.builder()
                .status(OrderStatus.PENDING)
                .items(List.of(item))
                .build();

        when(orderRepository.findByStripePaymentIntentIdForUpdate("pi_cancelled"))
                .thenReturn(Optional.of(order));
        when(productRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(product));

        orderService.cancelPayment("pi_cancelled");

        assertThat(order.getStatus()).isEqualTo(OrderStatus.CANCELLED);
        assertThat(product.getStockQuantity()).isEqualTo(5);
    }

    @Test
    void deletesAlreadyCancelledOrderWithoutChangingStock() {
        Order order = Order.builder()
                .id(7L)
                .status(OrderStatus.CANCELLED)
                .items(List.of())
                .build();
        when(orderRepository.findByIdForUpdate(7L)).thenReturn(Optional.of(order));

        orderService.deleteOrder(7L);

        verify(orderRepository).delete(order);
    }
}
