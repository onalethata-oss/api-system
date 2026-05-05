package com.tylersoft.eclectics.controller;

import com.tylersoft.eclectics.dto.response.ApiResponse;
import com.tylersoft.eclectics.dto.response.AssignmentDto;
import com.tylersoft.eclectics.dto.request.ApiBulkAssignRequest;
import com.tylersoft.eclectics.service.ApiResourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user-api-assignments")
@RequiredArgsConstructor
public class UserApiAssignmentController {

    private final ApiResourceService apiResourceService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AssignmentDto>>> listAssignments() {
        List<AssignmentDto> dtos = apiResourceService.getAllAssignments().stream()
                .map(AssignmentDto::fromEntity)
                .toList();
        return ResponseEntity.ok(ApiResponse.ok(dtos));
    }

    @PutMapping("/{id}/active")
    public ResponseEntity<ApiResponse<AssignmentDto>> toggleAssignment(
            @PathVariable Long id,
            @RequestParam boolean active,
            @AuthenticationPrincipal UserDetails actor
    ) {
        var saved = apiResourceService.toggleAssignmentActive(id, active, actor.getUsername());
        return ResponseEntity.ok(
                ApiResponse.ok("Assignment status updated", AssignmentDto.fromEntity(saved))
        );
    }

    @PostMapping("/users/{userId}/apis/{apiId}")
    public ResponseEntity<ApiResponse<String>> assignApi(
            @PathVariable Long userId,
            @PathVariable Long apiId,
            @AuthenticationPrincipal UserDetails actor
    ) {
        apiResourceService.assignApi(userId, apiId, actor.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("API assigned to user", "SUCCESS"));
    }

    @PostMapping("/users/{userId}/apis/assign/bulk")
    public ResponseEntity<ApiResponse<String>> assignApisBulk(
            @PathVariable Long userId,
            @RequestBody ApiBulkAssignRequest request,
            @AuthenticationPrincipal UserDetails actor
    ) {
        apiResourceService.assignApisBulk(userId, request.getApis(), actor.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("APIs assigned successfully", "SUCCESS"));
    }

    @DeleteMapping("/users/{userId}/apis/{apiId}")
    public ResponseEntity<ApiResponse<String>> revokeApi(
            @PathVariable Long userId,
            @PathVariable Long apiId,
            @AuthenticationPrincipal UserDetails actor
    ) {
        apiResourceService.revokeApi(userId, apiId, actor.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("API access revoked", "SUCCESS"));
    }
}
