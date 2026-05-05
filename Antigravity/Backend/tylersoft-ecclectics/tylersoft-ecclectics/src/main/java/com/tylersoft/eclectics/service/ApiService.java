package com.tylersoft.eclectics.service;

import com.tylersoft.eclectics.dto.response.ApiDto;
import com.tylersoft.eclectics.repository.ApiResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ApiService {

    private final ApiResourceRepository apiResourceRepository;

    @Transactional(readOnly = true)
    public List<ApiDto> getAllApis() {
        return apiResourceRepository.findAll()
                .stream()
                .map(api -> new ApiDto(
                        api.getId(),
                        api.getName(),
                        api.getEndpointUrl(),
                        api.getDescription(),
                        api.getCreatedAt()
                ))
                .toList();
    }
}