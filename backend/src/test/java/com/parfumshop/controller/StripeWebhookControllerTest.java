package com.parfumshop.controller;

import com.parfumshop.service.OrderService;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

class StripeWebhookControllerTest {

    @Test
    void rejectsWebhookWithInvalidSignature() {
        StripeWebhookController controller = new StripeWebhookController(mock(OrderService.class));
        ReflectionTestUtils.setField(controller, "webhookSecret", "whsec_test");

        var response = controller.handleWebhook("{}", "invalid-signature");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }
}
