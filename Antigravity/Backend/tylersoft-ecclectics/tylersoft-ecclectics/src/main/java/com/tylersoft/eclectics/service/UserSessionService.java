package com.tylersoft.eclectics.service;

import com.tylersoft.eclectics.entity.User;
import com.tylersoft.eclectics.entity.UserSession;
import com.tylersoft.eclectics.repository.UserSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserSessionService {

    private final UserSessionRepository repository;

    // =========================
    // CREATE SESSION
    // =========================
    public UserSession createSession(User user, String token, String ip, String userAgent) {

        UserSession session = new UserSession();
        session.setUser(user);
        session.setToken(token);
        session.setIpAddress(ip);
        session.setUserAgent(userAgent);
        session.setActive(true);
        session.setLoginTime(LocalDateTime.now());

        return repository.save(session);
    }

    // =========================
    // GET SESSIONS BY USER ID
    // =========================
    public List<UserSession> getSessionsByUserId(Long userId) {
        return repository.findByUser_Id(userId);
    }

    // =========================
    // LOGOUT SESSION
    // =========================
    public void logoutSession(Long sessionId) {

        UserSession session = repository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        session.setActive(false);
        session.setLogoutTime(LocalDateTime.now());

        repository.save(session);
    }
}