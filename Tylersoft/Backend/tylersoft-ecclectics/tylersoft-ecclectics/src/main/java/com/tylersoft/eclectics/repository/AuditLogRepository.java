package com.tylersoft.eclectics.repository;

import com.tylersoft.eclectics.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    // 🔥 Filter logs by user (most common use case)
    Page<AuditLog> findByActorEmailOrderByPerformedAtDesc(
            String actorEmail,
            Pageable pageable
    );

    // 🔥 Get all logs sorted newest first (admin view)
    Page<AuditLog> findAllByOrderByPerformedAtDesc(Pageable pageable);

    // 🔥 OPTIONAL (VERY USEFUL): filter by action type
    Page<AuditLog> findByActionOrderByPerformedAtDesc(
            String action,
            Pageable pageable
    );
}