package com.tylersoft.eclectics.dto.response;

import java.time.LocalDateTime;

public record ApiDto(
        Long id,
        String name,
        String endpointUrl,
        String description,
        LocalDateTime createdAt
) {}