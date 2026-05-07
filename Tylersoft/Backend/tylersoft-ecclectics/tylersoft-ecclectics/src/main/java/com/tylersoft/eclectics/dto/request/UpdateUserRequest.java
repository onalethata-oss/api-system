package com.tylersoft.eclectics.dto.request;

import com.tylersoft.eclectics.enums.Role;
import lombok.Data;

@Data
public class UpdateUserRequest {
    private String name;
    private String email;
    private Role role;
}
