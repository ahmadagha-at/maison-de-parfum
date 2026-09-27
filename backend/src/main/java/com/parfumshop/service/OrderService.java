package com.parfumshop.service;

import com.parfumshop.dto.request.OrderItemRequest;
import com.parfumshop.dto.request.OrderRequest;
import com.parfumshop.dto.response.OrderItemResponse;
import com.parfumshop.dto.response.OrderResponse;
import com.parfumshop.entity.Order;
import com.parfumshop.entity.OrderItem;
import com.parfumshop.entity.Product;
import com.parfumshop.entity.User;
import com.parfumshop.enums.OrderStatus;
import com.parfumshop.exception.InsufficientStockException;
import com.parfumshop.exception.ResourceNotFoundException;
import com.parfumshop.repository.OrderRepository;
import com.parfumshop.repository.ProductRepository;
import com.parfumshop.repository.UserRepository;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.stripe.model.Refund;
import com.stripe.net.RequestOptions;
import com.stripe.param.RefundCreateParams;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    /**
     * Creates a new order for the authenticated user.
     * Stock is checked and decremented atomically within a single transaction.
     * Throws InsufficientStockException if any product lacks sufficient stock.
     */
    @Transactional
    public OrderResponse createOrder(Long userId, OrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        Order order = Order.builder()
                .user(user)
                .shippingAddress(request.getShippingAddress())
                .status(OrderStatus.PENDING)
                .totalAmount(BigDecimal.ZERO)
                .items(orderItems)
                .build();

        Order savedOrder = orderRepository.save(order);

        for (OrderItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findActiveByIdForUpdate(itemRequest.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", itemRequest.getProductId()));

            if (product.getStockQuantity() < itemRequest.getQuantity()) {
                throw new InsufficientStockException(
                        product.getName(),
                        itemRequest.getQuantity(),
                        product.getStockQuantity()
                );
            }

            // Decrement stock
            product.setStockQuantity(product.getStockQuantity() - itemRequest.getQuantity());
            productRepository.save(product);

            BigDecimal subtotal = product.getPrice()
                    .multiply(BigDecimal.valueOf(itemRequest.getQuantity()));

            OrderItem orderItem = OrderItem.builder()
                    .order(savedOrder)
                    .product(product)
                    .quantity(itemRequest.getQuantity())
                    .unitPrice(product.getPrice())
                    .subtotal(subtotal)
                    .build();

            orderItems.add(orderItem);
            totalAmount = totalAmount.add(subtotal);
        }

        savedOrder.setItems(orderItems);
        savedOrder.setTotalAmount(totalAmount);
        orderRepository.save(savedOrder);

        // Create Stripe PaymentIntent
        String clientSecret;
        try {
            PaymentIntentCreateParams params =
                    PaymentIntentCreateParams.builder()
                            // Amount in cents
                            .setAmount(totalAmount.multiply(new BigDecimal(100)).longValue())
                            .setCurrency("eur")
                            .putMetadata("orderId", savedOrder.getId().toString())
                            .putMetadata("userId", user.getId().toString())
                            .build();

            PaymentIntent intent = PaymentIntent.create(params);
            savedOrder.setStripePaymentIntentId(intent.getId());
            orderRepository.save(savedOrder);
            clientSecret = intent.getClientSecret();
        } catch (Exception e) {
            throw new RuntimeException("Failed to create Stripe PaymentIntent", e);
        }

        return mapToResponseWithSecret(savedOrder, clientSecret);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getUserOrders(Long userId, Pageable pageable) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getOrdersByUserEmail(String email, Pageable pageable) {
        String normalizedEmail = email.trim();
        if (!userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new ResourceNotFoundException("User", "email", normalizedEmail);
        }

        return orderRepository.findByUser_EmailIgnoreCaseOrderByCreatedAtDesc(normalizedEmail, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(noRollbackFor = IllegalStateException.class)
    public void deleteOrder(Long orderId) {
        Order order = orderRepository.findByIdForUpdate(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (order.getStatus() == OrderStatus.PENDING) {
            if (!cancelPendingOrder(order)) {
                throw new IllegalStateException("A successfully paid order cannot be deleted");
            }
        } else if (order.getStatus() != OrderStatus.CANCELLED && order.getStatus() != OrderStatus.REFUNDED) {
            throw new IllegalStateException("Paid orders must be cancelled or refunded instead of deleted");
        }

        orderRepository.delete(order);
    }

    @Transactional
    public void confirmPayment(String paymentIntentId) {
        Order order = orderRepository.findByStripePaymentIntentIdForUpdate(paymentIntentId)
                .orElse(null);
        if (order == null) {
            return;
        }
        if (order.getStatus() == OrderStatus.PENDING) {
            order.setStatus(OrderStatus.CONFIRMED);
        }
    }

    @Transactional
    public void cancelPayment(String paymentIntentId) {
        Order order = orderRepository.findByStripePaymentIntentIdForUpdate(paymentIntentId)
                .orElse(null);
        if (order == null) {
            return;
        }
        if (order.getStatus() == OrderStatus.PENDING) {
            restoreStock(order);
            order.setStatus(OrderStatus.CANCELLED);
        }
    }

    @Transactional
    public void cancelExpiredOrder(Long orderId) {
        Order order = orderRepository.findByIdForUpdate(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
        if (order.getStatus() == OrderStatus.PENDING) {
            cancelPendingOrder(order);
        }
    }

    @Transactional
    public OrderResponse reconcilePayment(Long orderId, Long userId) {
        Order order = orderRepository.findByIdForUpdate(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (!order.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Order", "id", orderId);
        }
        if (order.getStatus() != OrderStatus.PENDING) {
            return mapToResponse(order);
        }
        if (order.getStripePaymentIntentId() == null) {
            throw new IllegalStateException("The order has no Stripe PaymentIntent");
        }

        try {
            PaymentIntent intent = PaymentIntent.retrieve(order.getStripePaymentIntentId());
            if ("succeeded".equals(intent.getStatus())) {
                order.setStatus(OrderStatus.CONFIRMED);
            } else if ("canceled".equals(intent.getStatus())) {
                restoreStock(order);
                order.setStatus(OrderStatus.CANCELLED);
            } else {
                throw new IllegalStateException("Stripe has not confirmed the payment yet");
            }
        } catch (IllegalStateException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new IllegalStateException("Could not verify the Stripe payment", ex);
        }

        return mapToResponse(order);
    }

    private boolean cancelPendingOrder(Order order) {
        try {
            if (order.getStripePaymentIntentId() != null) {
                PaymentIntent intent = PaymentIntent.retrieve(order.getStripePaymentIntentId());
                if ("succeeded".equals(intent.getStatus())) {
                    order.setStatus(OrderStatus.CONFIRMED);
                    return false;
                }
                if (!"canceled".equals(intent.getStatus())) {
                    intent.cancel();
                }
            }
        } catch (Exception ex) {
            throw new IllegalStateException("Stripe payment cancellation failed", ex);
        }

        restoreStock(order);
        order.setStatus(OrderStatus.CANCELLED);
        return true;
    }

    private void restoreStock(Order order) {
        for (OrderItem item : order.getItems()) {
            Product product = productRepository.findByIdForUpdate(item.getProduct().getId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Product", "id", item.getProduct().getId()));
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
        }
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long orderId, Long requestingUserId, boolean isAdmin) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (!isAdmin && !order.getUser().getId().equals(requestingUserId)) {
            throw new ResourceNotFoundException("Order", "id", orderId);
        }

        return mapToResponse(order);
    }

    private OrderResponse mapToResponse(Order order) {
        return mapToResponseWithSecret(order, null);
    }

    private OrderResponse mapToResponseWithSecret(Order order, String clientSecret) {
        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(item -> OrderItemResponse.builder()
                        .id(item.getId())
                        .productId(item.getProduct().getId())
                        .productName(item.getProduct().getName())
                        .productBrand(item.getProduct().getBrand())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .subtotal(item.getSubtotal())
                        .build())
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUser().getId())
                .userEmail(order.getUser().getEmail())
                .items(itemResponses)
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus().name())
                .shippingAddress(order.getShippingAddress())
                .clientSecret(clientSecret)
                .createdAt(order.getCreatedAt())
                .build();
    }

    @Transactional
    public OrderResponse refundOrder(Long orderId) {
        Order order = orderRepository.findByIdForUpdate(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (order.getStatus() == OrderStatus.REFUNDED) {
            return mapToResponse(order);
        }

        if (order.getStatus() != OrderStatus.CONFIRMED
                && order.getStatus() != OrderStatus.SHIPPED
                && order.getStatus() != OrderStatus.DELIVERED) {
            throw new IllegalStateException("Only paid orders can be refunded");
        }

        if (order.getStripePaymentIntentId() == null) {
            throw new IllegalStateException("The order has no Stripe payment to refund");
        }

        try {
            Refund refund = order.getStripeRefundId() == null
                    ? Refund.create(
                    RefundCreateParams.builder()
                            .setPaymentIntent(order.getStripePaymentIntentId())
                            .build(),
                    RequestOptions.builder()
                            .setIdempotencyKey("order-refund-" + order.getId())
                            .build()
            )
                    : Refund.retrieve(order.getStripeRefundId());

            order.setStripeRefundId(refund.getId());

            if ("succeeded".equals(refund.getStatus())) {
                restoreStock(order);
                order.setStatus(OrderStatus.REFUNDED);
            } else if ("failed".equals(refund.getStatus())
                    || "canceled".equals(refund.getStatus())) {
                throw new IllegalStateException(
                        "Stripe refund failed: " + refund.getStatus()
                );
            }

            return mapToResponse(order);
        } catch (IllegalStateException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new IllegalStateException("Could not verify the Stripe refund", ex);
        }
    }
}
