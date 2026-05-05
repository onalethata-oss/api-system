package com.tylersoft.eclectics.controller;

import com.tylersoft.eclectics.dto.response.ApiResponse;
import com.tylersoft.eclectics.entity.ApiResource;
import com.tylersoft.eclectics.service.ApiResourceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserApiController {

    private final ApiResourceService apiResourceService;

    // Get all APIs assigned to logged-in user
    @GetMapping("/apis")
    public ResponseEntity<ApiResponse<List<ApiResource>>> getMyApis(
            @AuthenticationPrincipal UserDetails user) {

        List<ApiResource> apis =
                apiResourceService.getApisForUser(user.getUsername());

        return ResponseEntity.ok(ApiResponse.ok(apis));
    }

    // Get single API (access check performed in service layer)
    @GetMapping("/apis/{id}")
    public ResponseEntity<ApiResponse<ApiResource>> getApiDetail(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails user) {

        ApiResource api =
                apiResourceService.getUserApiById(user.getUsername(), id);

        return ResponseEntity.ok(ApiResponse.ok(api));
    }

    // Get docs for a user's API
    @GetMapping("/apis/{id}/docs")
    public ResponseEntity<Resource> getDocs(@PathVariable Long id, @AuthenticationPrincipal UserDetails user) {
        // First verify they have access
        ApiResource api = apiResourceService.getUserApiById(user.getUsername(), id);
        
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
            log.error("Failed to resolve documentation file for API id={}", id, e);
        }
        
        return ResponseEntity.notFound().build();
    }
}