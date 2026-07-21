package com.parfumshop.service;

import com.parfumshop.entity.RefreshToken;
import com.parfumshop.entity.User;
import com.parfumshop.exception.TokenRefreshException;
import com.parfumshop.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    @Value("${application.security.jwt.refresh-expiration}")
    private long refreshTokenExpirationMs;

    private final RefreshTokenRepository refreshTokenRepository;

    @Transactional
    public IssuedRefreshToken createRefreshToken(User user) {
        // Revoke any existing tokens for this user before issuing a new one
        refreshTokenRepository.revokeAllUserTokens(user);

        String rawToken = UUID.randomUUID().toString() + UUID.randomUUID();
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(hashToken(rawToken))
                .expiresAt(Instant.now().plusMillis(refreshTokenExpirationMs))
                .revoked(false)
                .build();

        return new IssuedRefreshToken(refreshTokenRepository.save(refreshToken), rawToken);
    }

    @Transactional(readOnly = true)
    public RefreshToken verifyAndGetToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByTokenAndRevokedFalse(hashToken(token))
                .orElseThrow(() -> new TokenRefreshException(token, "Refresh token not found or has been revoked"));

        if (refreshToken.getExpiresAt().isBefore(Instant.now())) {
            throw new TokenRefreshException(token, "Refresh token has expired. Please log in again.");
        }

        return refreshToken;
    }

    @Transactional
    public void revokeAllUserTokens(User user) {
        refreshTokenRepository.revokeAllUserTokens(user);
    }

    @Transactional
    @Scheduled(cron = "${application.security.refresh-cleanup-cron:0 0 3 * * *}")
    public void cleanupExpiredTokens() {
        refreshTokenRepository.deleteExpiredAndRevokedTokens(Instant.now());
    }

    private String hashToken(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 is not available", ex);
        }
    }

    public record IssuedRefreshToken(RefreshToken entity, String rawToken) {
    }
}
