package com.tylersoft.eclectics.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "user_api_assignments",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_user_api",
        columnNames = {"user_id", "api_id"}
    )
)
@Getter
@Setter
@ToString(exclude = {"user", "api", "assignedBy"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserApiAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "api_id", nullable = false)
    private ApiResource api;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_by")
    private User assignedBy;

    @Column(nullable = false, updatable = false)
    private LocalDateTime assignedAt;

    @Column(columnDefinition = "boolean default true")
    @Builder.Default
    private boolean active = true;

    @PrePersist
    public void onCreate() {
        this.assignedAt = LocalDateTime.now();
    }
}