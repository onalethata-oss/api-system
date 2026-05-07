package com.tylersoft.eclectics.controller;

import com.tylersoft.eclectics.dto.request.CreateUserRequest;
import com.tylersoft.eclectics.dto.request.LoginRequest;
import com.tylersoft.eclectics.entity.User;
import com.tylersoft.eclectics.entity.UserSession;
import com.tylersoft.eclectics.repository.UserRepository;
import com.tylersoft.eclectics.security.JwtUtil;
import com.tylersoft.eclectics.service.UserService;
import com.tylersoft.eclectics.service.UserSessionService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final UserService userService;
    private final UserSessionService userSessionService;

    // =========================
    // REGISTER
    // =========================
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody CreateUserRequest request) {

        User user = userService.createUser(request, "system");

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "User registered successfully",
                "userId", user.getId()
        ));
    }

    // =========================
    // LOGIN
    // =========================
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request,
            HttpServletRequest httpRequest
    ) {

        java.util.Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());
        
        if (optionalUser.isEmpty() || !passwordEncoder.matches(request.getPassword(), optionalUser.get().getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "error", "Invalid email or password"));
        }
        
        User user = optionalUser.get();

        String token = jwtUtil.generateToken(
                user.getEmail(),
                user.getRole().name()
        );

        String ip = httpRequest.getRemoteAddr();
        String userAgent = httpRequest.getHeader("User-Agent");

        UserSession session = userSessionService.createSession(
                user,
                token,
                ip,
                userAgent
        );

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Login successful",
                "token", token,
                "sessionId", session.getId(),
                "email", user.getEmail(),
                "role", user.getRole()
        ));
    }

    // =========================
    // LOGOUT
    // =========================
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestParam Long sessionId) {

        userSessionService.logoutSession(sessionId);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Logged out successfully"
        ));
    }

    // =========================
    // GET SESSIONS (FIXED ENDPOINT)
    // =========================
    @GetMapping("/sessions")
    public ResponseEntity<?> getSessions(@RequestParam Long userId) {

        return ResponseEntity.ok(
                userSessionService.getSessionsByUserId(userId)
        );
    }
}