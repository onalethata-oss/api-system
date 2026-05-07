package com.tylersoft.eclectics.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class ApiBulkAssignRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "API list cannot be empty")
    @Size(min = 1, message = "At least one API must be provided")
    private List<ApiAssignRequest> apis;
}