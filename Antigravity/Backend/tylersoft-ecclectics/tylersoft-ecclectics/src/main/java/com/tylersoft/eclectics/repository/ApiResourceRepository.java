package com.tylersoft.eclectics.repository;

import com.tylersoft.eclectics.entity.ApiResource;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ApiResourceRepository extends JpaRepository<ApiResource, Long> {

    Optional<ApiResource> findByEndpointUrl(String endpointUrl);
}