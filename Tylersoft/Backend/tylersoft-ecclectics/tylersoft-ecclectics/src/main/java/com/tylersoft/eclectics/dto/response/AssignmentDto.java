package com.tylersoft.eclectics.dto.response;

import com.tylersoft.eclectics.entity.UserApiAssignment;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AssignmentDto {
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private Long apiId;
    private String apiName;
    private String endpointUrl;
    private String assignedBy;
    private LocalDateTime assignedAt;
    private boolean active;

    public static AssignmentDto fromEntity(UserApiAssignment entity) {
        return AssignmentDto.builder()
                .id(entity.getId())
                .userId(entity.getUser().getId())
                .userName(entity.getUser().getName())
                .userEmail(entity.getUser().getEmail())
                .apiId(entity.getApi().getId())
                .apiName(entity.getApi().getName())
                .endpointUrl(entity.getApi().getEndpointUrl())
                .assignedBy(entity.getAssignedBy() != null ? entity.getAssignedBy().getName() : "System")
                .assignedAt(entity.getAssignedAt())
                .active(entity.isActive())
                .build();
    }
}
