package com.tylersoft.eclectics.service;

import com.tylersoft.eclectics.dto.request.ApiAssignRequest;
import com.tylersoft.eclectics.entity.ApiResource;
import com.tylersoft.eclectics.entity.User;
import com.tylersoft.eclectics.entity.UserApiAssignment;
import com.tylersoft.eclectics.exception.CustomException;
import com.tylersoft.eclectics.repository.ApiResourceRepository;
import com.tylersoft.eclectics.repository.UserApiAssignmentRepository;
import com.tylersoft.eclectics.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ApiResourceService {

    private final ApiResourceRepository apiResourceRepository;
    private final UserApiAssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;
    private final PdfParserService pdfParserService;

    // =========================
    // GET ALL APIs
    // =========================
    public List<ApiResource> getAllApis() {
        return apiResourceRepository.findAll();
    }

    // =========================
    // GET API BY ID
    // =========================
    public ApiResource getApiById(Long id) {
        return apiResourceRepository.findById(id)
                .orElseThrow(() -> new CustomException(
                        "API resource not found",
                        HttpStatus.NOT_FOUND
                ));
    }

    // =========================
    // CREATE API
    // =========================
    @Transactional
    public ApiResource createApi(ApiAssignRequest request, String actorEmail) {

        User creator = getUserByEmail(actorEmail);

        ApiResource api = ApiResource.builder()
                .name(request.getName())
                .endpointUrl(request.getEndpointUrl())
                .description(request.getDescription())
                .documentation(request.getDocumentation())
                .createdBy(creator)
                .build();

        ApiResource saved = apiResourceRepository.save(api);

        log(actorEmail, "CREATE_API", "Created API: " + saved.getName(), saved.getId());

        return saved;
    }

    // =========================
    // UPDATE API
    // =========================
    @Transactional
    public ApiResource updateApi(Long id, ApiAssignRequest request, String actorEmail) {
        ApiResource api = getApiById(id);

        if (request.getName() != null && !request.getName().isBlank()) api.setName(request.getName());
        if (request.getEndpointUrl() != null && !request.getEndpointUrl().isBlank()) api.setEndpointUrl(request.getEndpointUrl());
        if (request.getDescription() != null) api.setDescription(request.getDescription());
        if (request.getDocumentation() != null) api.setDocumentation(request.getDocumentation());

        ApiResource saved = apiResourceRepository.save(api);

        log(actorEmail, "UPDATE_API", "Updated API: " + saved.getName(), saved.getId());

        return saved;
    }

    // =========================
    // DELETE API
    // =========================
    @Transactional
    public void deleteApi(Long id, String actorEmail) {
        ApiResource api = getApiById(id);
        
        assignmentRepository.deleteByApiId(id);
        apiResourceRepository.delete(api);

        log(actorEmail, "DELETE_API", "Deleted API: " + api.getName(), id);
    }

    // =========================
    // UPLOAD DOCS
    // =========================
    @Transactional
    public ApiResource uploadDocs(Long id, MultipartFile file, String actorEmail) {
        ApiResource api = getApiById(id);

        try {
            // Save the file to disk
            String dirPath = "uploads/docs";
            Path uploadPath = Paths.get(dirPath);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath);

            api.setDocumentation(filePath.toString());

            // Parse the PDF and generate structured JSON
            String originalName = file.getOriginalFilename();
            if (originalName != null && originalName.toLowerCase().endsWith(".pdf")) {
                String parsedJson = pdfParserService.parsePdfToJson(filePath);
                if (parsedJson != null) {
                    api.setParsedDocumentation(parsedJson);
                }
            }

            ApiResource saved = apiResourceRepository.save(api);

            log(actorEmail, "UPLOAD_DOCS", "Uploaded docs for API: " + api.getName(), saved.getId());

            return saved;
        } catch (IOException e) {
            throw new CustomException("Failed to upload file", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // =========================
    // BULK ASSIGN APIs
    // =========================
    @Transactional
    public void assignApisBulk(Long userId, List<ApiAssignRequest> apis, String actorEmail) {

        User user = getUserById(userId);
        if (user.getRole() == com.tylersoft.eclectics.enums.Role.ADMIN) {
            throw new CustomException("Admin users cannot be assigned APIs", HttpStatus.BAD_REQUEST);
        }
        User actor = getUserByEmail(actorEmail);

        for (ApiAssignRequest dto : apis) {

            ApiResource api = getOrCreateApi(dto, actor);

            if (assignmentRepository.existsByUserIdAndApiId(userId, api.getId())) {
                continue;
            }

            assignmentRepository.save(
                    UserApiAssignment.builder()
                            .user(user)
                            .api(api)
                            .assignedBy(actor)
                            .build()
            );

            log(actorEmail,
                    "ASSIGN_API_BULK",
                    "Assigned API " + api.getName() + " to user " + userId,
                    userId);
        }
    }

    // =========================
    // ASSIGN SINGLE API
    // =========================
    @Transactional
    public void assignApi(Long userId, Long apiId, String actorEmail) {

        User user = getUserById(userId);
        if (user.getRole() == com.tylersoft.eclectics.enums.Role.ADMIN) {
            throw new CustomException("Admin users cannot be assigned APIs", HttpStatus.BAD_REQUEST);
        }
        User actor = getUserByEmail(actorEmail);
        ApiResource api = getApiById(apiId);

        if (assignmentRepository.existsByUserIdAndApiId(userId, apiId)) {
            throw new CustomException("API already assigned", HttpStatus.CONFLICT);
        }

        assignmentRepository.save(
                UserApiAssignment.builder()
                        .user(user)
                        .api(api)
                        .assignedBy(actor)
                        .build()
        );

        log(actorEmail,
                "ASSIGN_API",
                "Assigned API " + apiId + " to user " + userId,
                userId);
    }

    // =========================
    // REVOKE API
    // =========================
    @Transactional
    public void revokeApi(Long userId, Long apiId, String actorEmail) {

        getUserById(userId);
        getApiById(apiId);

        assignmentRepository.deleteByUserIdAndApiId(userId, apiId);

        log(actorEmail,
                "REVOKE_API",
                "Revoked API " + apiId + " from user " + userId,
                userId);
    }

    // =========================
    // TOGGLE ASSIGNMENT STATUS
    // =========================
    @Transactional
    public UserApiAssignment toggleAssignmentActive(Long assignmentId, boolean active, String actorEmail) {
        UserApiAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new CustomException("Assignment not found", HttpStatus.NOT_FOUND));

        assignment.setActive(active);
        UserApiAssignment saved = assignmentRepository.save(assignment);

        log(actorEmail,
                "TOGGLE_ASSIGNMENT",
                "Set API assignment " + assignmentId + " active status to " + active,
                assignmentId);

        return saved;
    }



    // =========================
    // GET USER APIS
    // =========================
    public List<ApiResource> getApisForUser(String email) {
        return assignmentRepository.findApisByUserEmail(email);
    }

    public ApiResource getUserApiById(String email, Long apiId) {

    return assignmentRepository.findUserApiByEmailAndApiId(email, apiId)
            .orElseThrow(() -> new CustomException(
                    "API not found or not assigned to user",
                    HttpStatus.FORBIDDEN
            ));
    }

    // =========================
    // GET APIS BY USER ID
    // =========================
    @Transactional(readOnly = true)
    public List<ApiResource> getApisByUserId(Long userId) {
        return assignmentRepository.findByUserId(userId).stream()
                .map(UserApiAssignment::getApi)
                .toList();
    }

    // =========================
    // GET ALL ASSIGNMENTS
    // =========================
    @Transactional(readOnly = true)
    public List<UserApiAssignment> getAllAssignments() {
        return assignmentRepository.findAll();
    }

    // =========================
    // HELPERS
    // =========================

    private ApiResource getOrCreateApi(ApiAssignRequest dto, User actor) {

        return apiResourceRepository.findByEndpointUrl(dto.getEndpointUrl())
                .orElseGet(() -> apiResourceRepository.save(
                        ApiResource.builder()
                                .name(dto.getName())
                                .endpointUrl(dto.getEndpointUrl())
                                .description(dto.getDescription())
                                .documentation(dto.getDocumentation())
                                .createdBy(actor)
                                .build()
                ));
    }

    private User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new CustomException(
                        "User not found",
                        HttpStatus.NOT_FOUND
                ));
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(
                        "Actor not found",
                        HttpStatus.NOT_FOUND
                ));
    }

    private void log(String actor, String action, String message, Long entityId) {
        auditLogService.log(actor, action, "ApiResource", entityId, message, null);
    }

}