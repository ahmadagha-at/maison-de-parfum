package com.parfumshop.service;

import com.parfumshop.entity.RefreshToken;
import com.parfumshop.entity.User;
import com.parfumshop.repository.RefreshTokenRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    @Mock
    private RefreshTokenRepository repository;

    private RefreshTokenService service;

    @BeforeEach
    void setUp() {
        service = new RefreshTokenService(repository);
        ReflectionTestUtils.setField(service, "refreshTokenExpirationMs", 60_000L);
    }

    @Test
    void storesOnlyHashAndVerifiesUsingRawToken() {
        User user = User.builder().id(1L).build();
        when(repository.save(any(RefreshToken.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        RefreshTokenService.IssuedRefreshToken issued = service.createRefreshToken(user);

        assertThat(issued.rawToken()).isNotBlank();
        assertThat(issued.entity().getToken()).isNotEqualTo(issued.rawToken());
        assertThat(issued.entity().getToken()).hasSize(64);

        when(repository.findByTokenAndRevokedFalse(issued.entity().getToken()))
                .thenReturn(Optional.of(issued.entity()));

        assertThat(service.verifyAndGetToken(issued.rawToken())).isSameAs(issued.entity());
    }
}
