package com.tylersoft.eclectics.security;

public final class SecurityConstants {

    private SecurityConstants() {}

    public static final String TOKEN_PREFIX   = "Bearer ";
    public static final String HEADER_STRING  = "Authorization";

    public static final String[] PUBLIC_URLS = {
        "/api/auth/**",
        "/actuator/health",
        "/swagger-ui/**",
        "/v3/api-docs/**"
    };

    public static final String ROLE_ADMIN = "ROLE_ADMIN";
    public static final String ROLE_USER  = "ROLE_USER";
}
