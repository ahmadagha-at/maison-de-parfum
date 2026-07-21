package com.parfumshop.security;

import lombok.Getter;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;

/**
 * Lightweight principal populated from JWT claims.
 * Stored in the SecurityContext for stateless requests.
 * Avoids DB lookups on every API call.
 */
@Getter
public class JwtAuthenticatedPrincipal {

    private final Long id;
    private final String email;
    private final List<SimpleGrantedAuthority> authorities;

    public JwtAuthenticatedPrincipal(Long id, String email, List<SimpleGrantedAuthority> authorities) {
        this.id = id;
        this.email = email;
        this.authorities = authorities;
    }
}
