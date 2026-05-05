package com.tylersoft.eclectics.service;

import com.tylersoft.eclectics.dto.request.CreateUserRequest;
import com.tylersoft.eclectics.entity.User;
import com.tylersoft.eclectics.entity.UserSession;
import com.tylersoft.eclectics.enums.Role;
import com.tylersoft.eclectics.exception.CustomException;
import com.tylersoft.eclectics.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;
    private final com.tylersoft.eclectics.repository.UserApiAssignmentRepository assignmentRepository;
    private final UserSessionService sessionService;

    // =========================
    // GET ALL USERS
    // =========================
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // =========================
    // GET USER BY ID
    // =========================
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() ->
                        new CustomException("User not found", HttpStatus.NOT_FOUND));
    }

    // =========================
    // CREATE USER (FIXED - NO 500 ERRORS)
    // =========================
    @Transactional
    public User createUser(CreateUserRequest request, String actorEmail) {

        // 1. Validate required fields
        if (request.getName() == null || request.getEmail() == null || request.getPassword() == null) {
            throw new CustomException("Name, email and password are required", HttpStatus.BAD_REQUEST);
        }

        // 2. Check duplicate email
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new CustomException("Email already in use", HttpStatus.CONFLICT);
        }

        // 3. Validate role (PREVENTS YOUR 500 ERROR)
        if (request.getRole() == null) {
            throw new CustomException("Role is required (USER or ADMIN)", HttpStatus.BAD_REQUEST);
        }

        // 4. Strict role validation
        if (request.getRole() != Role.USER && request.getRole() != Role.ADMIN) {
            throw new CustomException("Invalid role", HttpStatus.BAD_REQUEST);
        }

        // 5. Build user safely
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .active(true)
                .failedAttempts(0)
                .build();

        // 6. Save user
        User saved = userRepository.save(user);

        // 7. Audit log
        auditLogService.log(
                actorEmail,
                "CREATE_USER",
                "User",
                saved.getId(),
                "Created user: " + saved.getEmail(),
                null
        );

        return saved;
    }

    // =========================
    // LOGIN WITH SESSION TRACKING
    // =========================
    public UserSession loginUser(User user, String token, String ip, String userAgent) {

        if (!user.isActive()) {
            throw new CustomException("User account is disabled", HttpStatus.FORBIDDEN);
        }

        return sessionService.createSession(user, token, ip, userAgent);
    }

    // =========================
    // LOGOUT
    // =========================
    public void logoutUser(Long sessionId, String actorEmail) {

        sessionService.logoutSession(sessionId);

        auditLogService.log(
                actorEmail,
                "LOGOUT",
                "Session",
                sessionId,
                "User logged out",
                null
        );
    }

    // =========================
    // TOGGLE USER STATUS
    // =========================
    @Transactional
    public User toggleActive(Long id, boolean active, String actorEmail) {

        User user = getUserById(id);
        user.setActive(active);

        User saved = userRepository.save(user);

        auditLogService.log(
                actorEmail,
                active ? "ENABLE_USER" : "DISABLE_USER",
                "User",
                id,
                "Set active=" + active + " for " + user.getEmail(),
                null
        );

        return saved;
    }

    // =========================
    // UNLOCK USER
    // =========================
    @Transactional
    public void unlockUser(Long id, String actorEmail) {

        User user = getUserById(id);
        user.setFailedAttempts(0);
        user.setLockedUntil(null);

        userRepository.save(user);

        auditLogService.log(
                actorEmail,
                "UNLOCK_USER",
                "User",
                id,
                "Unlocked account for " + user.getEmail(),
                null
        );
    }

    // =========================
    // UPDATE USER
    // =========================
    @Transactional
    public User updateUser(Long id, com.tylersoft.eclectics.dto.request.UpdateUserRequest request, String actorEmail) {
        User user = getUserById(id);
        
        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
                throw new CustomException("Email already in use", HttpStatus.CONFLICT);
            }
            user.setEmail(request.getEmail());
        }
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }

        User saved = userRepository.save(user);

        auditLogService.log(actorEmail, "UPDATE_USER", "User", saved.getId(), "Updated user: " + saved.getEmail(), null);

        return saved;
    }

    // =========================
    // DELETE USER
    // =========================
    @Transactional
    public void deleteUser(Long id, String actorEmail) {
        User user = getUserById(id);
        
        assignmentRepository.deleteByUserId(id);
        userRepository.delete(user);

        auditLogService.log(actorEmail, "DELETE_USER", "User", id, "Deleted user: " + user.getEmail(), null);
    }
}