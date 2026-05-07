package com.tylersoft.eclectics.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_log")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 150)
    private String actorEmail;

    @Column(nullable = false, length = 100)
    private String action;

    @Column(length = 100)
    private String entityType;   // renamed from "entity" (cleaner naming)

    private Long entityId;

    @Column(columnDefinition = "TEXT")
    private String detail;

    @Column(length = 45)
    private String ipAddress;

    private LocalDateTime performedAt;

    // =========================
    // AUTO TIMESTAMP (FIX)
    // =========================
    @PrePersist
    public void prePersist() {
        this.performedAt = LocalDateTime.now();
    }
}