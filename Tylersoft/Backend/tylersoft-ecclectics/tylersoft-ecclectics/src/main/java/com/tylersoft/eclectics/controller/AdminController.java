package com.tylersoft.eclectics.controller;

import com.tylersoft.eclectics.dto.request.ApiAssignRequest;
import com.tylersoft.eclectics.dto.request.CreateUserRequest;
import com.tylersoft.eclectics.dto.response.ApiResponse;
import com.tylersoft.eclectics.dto.response.ApiDto;
import com.tylersoft.eclectics.dto.response.UserDto;
import com.tylersoft.eclectics.service.ApiResourceService;
import com.tylersoft.eclectics.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.net.MalformedURLException;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;
    private final ApiResourceService apiResourceService;

    // ================= USERS =================

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserDto>>> listUsers() {
        List<UserDto> dtos = userService.getAllUsers().stream()
                .map(UserDto::fromEntity)
                .toList();
        return ResponseEntity.ok(
                ApiResponse.ok(dtos)
        );
    }

    @PostMapping("/users")
    public ResponseEntity<ApiResponse<UserDto>> createUser(
            @Valid @RequestBody CreateUserRequest request,
            @AuthenticationPrincipal UserDetails actor
    ) {
        return ResponseEntity.ok(
                ApiResponse.ok(
                        "User created successfully",
                        UserDto.fromEntity(userService.createUser(request, actor.getUsername()))
                )
        );
    }

    @PutMapping("/users/{id}/active")
    public ResponseEntity<ApiResponse<UserDto>> toggleActive(
            @PathVariable Long id,
            @RequestParam boolean active,
            @AuthenticationPrincipal UserDetails actor
    ) {
        return ResponseEntity.ok(
                ApiResponse.ok(
                        "User status updated",
                        UserDto.fromEntity(userService.toggleActive(id, active, actor.getUsername()))
                )
        );
    }

    @PutMapping("/users/{id}/unlock")
    public ResponseEntity<ApiResponse<Void>> unlockUser(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails actor
    ) {
        userService.unlockUser(id, actor.getUsername());

        return ResponseEntity.ok(
                ApiResponse.ok("User unlocked", null)
        );
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserDto>> updateUser(
            @PathVariable Long id,
            @RequestBody com.tylersoft.eclectics.dto.request.UpdateUserRequest request,
            @AuthenticationPrincipal UserDetails actor
    ) {
        return ResponseEntity.ok(
                ApiResponse.ok("User updated", UserDto.fromEntity(userService.updateUser(id, request, actor.getUsername())))
        );
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails actor
    ) {
        userService.deleteUser(id, actor.getUsername());
        return ResponseEntity.ok(
                ApiResponse.ok("User deleted", null)
        );
    }

    // ================= APIs =================

    @GetMapping("/apis")
    public ResponseEntity<ApiResponse<List<ApiDto>>> listApis() {
        List<ApiDto> dtos = apiResourceService.getAllApis().stream()
                .map(api -> new ApiDto(api.getId(), api.getName(), api.getEndpointUrl(), api.getDescription(), api.getCreatedAt()))
                .toList();
        return ResponseEntity.ok(
                ApiResponse.ok(dtos)
        );
    }

    @PostMapping("/apis")
    public ResponseEntity<ApiResponse<ApiDto>> createApi(
            @Valid @RequestBody ApiAssignRequest request,
            @AuthenticationPrincipal UserDetails actor
    ) {
        var api = apiResourceService.createApi(request, actor.getUsername());
        return ResponseEntity.ok(
                ApiResponse.ok(
                        "API created successfully",
                        new ApiDto(api.getId(), api.getName(), api.getEndpointUrl(), api.getDescription(), api.getCreatedAt())
                )
        );
    }

    @PutMapping("/apis/{id}")
    public ResponseEntity<ApiResponse<ApiDto>> updateApi(
            @PathVariable Long id,
            @RequestBody ApiAssignRequest request,
            @AuthenticationPrincipal UserDetails actor
    ) {
        var api = apiResourceService.updateApi(id, request, actor.getUsername());
        return ResponseEntity.ok(
                ApiResponse.ok("API updated", new ApiDto(api.getId(), api.getName(), api.getEndpointUrl(), api.getDescription(), api.getCreatedAt()))
        );
    }

    @DeleteMapping("/apis/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteApi(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails actor
    ) {
        apiResourceService.deleteApi(id, actor.getUsername());
        return ResponseEntity.ok(
                ApiResponse.ok("API deleted", null)
        );
    }

    @PostMapping("/apis/{id}/docs")
    public ResponseEntity<ApiResponse<ApiDto>> uploadDocs(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails actor
    ) {
        var api = apiResourceService.uploadDocs(id, file, actor.getUsername());
        return ResponseEntity.ok(
                ApiResponse.ok("Documentation uploaded", new ApiDto(api.getId(), api.getName(), api.getEndpointUrl(), api.getDescription(), api.getCreatedAt()))
        );
    }

    @GetMapping("/apis/{id}/docs")
    public ResponseEntity<Resource> getDocs(@PathVariable Long id) {
        var api = apiResourceService.getApiById(id);
        if (api.getDocumentation() == null) {
            return ResponseEntity.notFound().build();
        }
        try {
            Path filePath = Paths.get(api.getDocumentation());
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() || resource.isReadable()) {
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            }
        } catch (MalformedURLException e) {
            // Log error
        }
        return ResponseEntity.notFound().build();
    }

    // Assignment endpoints have been moved to UserApiAssignmentController

    @GetMapping("/users/{userId}/apis")
    public ResponseEntity<ApiResponse<List<ApiDto>>> listUserApis(@PathVariable Long userId) {
        List<ApiDto> dtos = apiResourceService.getApisByUserId(userId).stream()
                .map(api -> new ApiDto(api.getId(), api.getName(), api.getEndpointUrl(), api.getDescription(), api.getCreatedAt()))
                .toList();
        return ResponseEntity.ok(ApiResponse.ok(dtos));
    }
}