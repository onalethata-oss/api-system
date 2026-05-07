package com.tylersoft.eclectics.repository;

import com.tylersoft.eclectics.entity.ApiResource;
import com.tylersoft.eclectics.entity.UserApiAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserApiAssignmentRepository extends JpaRepository<UserApiAssignment, Long> {

    // =========================
    // BASIC CRUD QUERIES
    // =========================

    List<UserApiAssignment> findByUserId(Long userId);

    List<UserApiAssignment> findByApiId(Long apiId);

    boolean existsByUserIdAndApiId(Long userId, Long apiId);

    Optional<UserApiAssignment> findByUserIdAndApiId(Long userId, Long apiId);

    void deleteByUserIdAndApiId(Long userId, Long apiId);

    void deleteByUserId(Long userId);

    void deleteByApiId(Long apiId);

    // =========================
    // USER EMAIL → APIS
    // =========================

    @Query("""
        SELECT ua.api 
        FROM UserApiAssignment ua 
        WHERE ua.user.email = :email
    """)
    List<ApiResource> findApisByUserEmail(@Param("email") String email);

    // =========================
    // ✅ FIXED METHOD (ADD THIS)
    // =========================

    @Query("""
        SELECT ua.api 
        FROM UserApiAssignment ua 
        WHERE ua.user.email = :email 
        AND ua.api.id = :apiId
    """)
    Optional<ApiResource> findUserApiByEmailAndApiId(
            @Param("email") String email,
            @Param("apiId") Long apiId
    );
}