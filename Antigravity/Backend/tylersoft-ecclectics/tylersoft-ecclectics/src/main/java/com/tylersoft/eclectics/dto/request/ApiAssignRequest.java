package com.tylersoft.eclectics.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ApiAssignRequest {

    @NotBlank(message = "API name is required")
    private String name;

    @NotBlank(message = "Endpoint URL is required")
    private String endpointUrl;

    private String description;

    private String documentation;
}
