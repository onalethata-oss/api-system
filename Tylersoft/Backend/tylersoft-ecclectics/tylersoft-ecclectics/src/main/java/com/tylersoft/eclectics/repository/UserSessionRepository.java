package com.tylersoft.eclectics.repository;

import com.tylersoft.eclectics.entity.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserSessionRepository extends JpaRepository<UserSession, Long> {

    List<UserSession> findByUser_Id(Long userId);  // ✅ FIXED

    List<UserSession> findByActiveTrue();
}