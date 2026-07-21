package com.parfumshop.controller;

import com.parfumshop.dto.request.LoginRequest;
import com.parfumshop.dto.request.RegisterRequest;
import com.parfumshop.dto.response.AuthResponse;
import com.parfumshop.exception.TokenRefreshException;
import com.parfumshop.security.JwtAuthenticatedPrincipal;
import com.parfumshop.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Value("${application.security.jwt.refresh-expiration}")
    private long refreshTokenExpirationMs;

    @Value("${application.security.cookie-secure:false}")
    private boolean secureCookie;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return withRefreshCookie(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return withRefreshCookie(authService.login(request), HttpStatus.OK);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(
            @CookieValue(name = "refreshToken", required = false) String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new TokenRefreshException("", "Refresh token is missing");
        }
        return withRefreshCookie(authService.refreshToken(refreshToken), HttpStatus.OK);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@AuthenticationPrincipal JwtAuthenticatedPrincipal principal) {
        authService.logout(principal.getId());
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, refreshCookie("", 0).toString())
                .build();
    }

    private ResponseEntity<AuthResponse> withRefreshCookie(AuthResponse response, HttpStatus status) {
        String refreshToken = response.getRefreshToken();
        response.setRefreshToken(null);
        return ResponseEntity.status(status)
                .header(HttpHeaders.SET_COOKIE, refreshCookie(
                        refreshToken, refreshTokenExpirationMs / 1000).toString())
                .body(response);
    }

    private ResponseCookie refreshCookie(String value, long maxAgeSeconds) {
        return ResponseCookie.from("refreshToken", value)
                .httpOnly(true)
                .secure(secureCookie)
                .sameSite("Strict")
                .path("/api/v1/auth")
                .maxAge(maxAgeSeconds)
                .build();
    }
}
