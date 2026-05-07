package com.tylersoft.eclectics.service;

import com.tylersoft.eclectics.entity.AuditLog;
import com.tylersoft.eclectics.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    // =========================
    // CREATE AUDIT LOG
    // =========================
    public void log(String actorEmail,
                    String action,
                    String entityType,
                    Long entityId,
                    String detail,
                    String ipAddress) {

        AuditLog log = AuditLog.builder()
                .actorEmail(actorEmail)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .detail(detail)
                .ipAddress(ipAddress != null ? ipAddress : "SYSTEM")
                .performedAt(LocalDateTime.now()) // 🔥 SAFE FIX
                .build();

        auditLogRepository.save(log);
    }

    // =========================
    // GET ALL LOGS (ADMIN)
    // =========================
    public Page<AuditLog> getAll(Pageable pageable) {
        return auditLogRepository.findAllByOrderByPerformedAtDesc(pageable);
    }

    // =========================
    // GET BY USER
    // =========================
    public Page<AuditLog> getByActor(String email, Pageable pageable) {
        return auditLogRepository.findByActorEmailOrderByPerformedAtDesc(email, pageable);
    }
}