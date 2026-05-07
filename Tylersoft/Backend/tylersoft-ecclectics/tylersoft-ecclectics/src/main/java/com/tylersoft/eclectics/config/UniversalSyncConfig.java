package com.tylersoft.eclectics.config;

import com.tylersoft.eclectics.service.ApiResourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class UniversalSyncConfig implements CommandLineRunner {

    private final ApiResourceService apiResourceService;

    @Override
    public void run(String... args) {
        System.out.println("[BOOT] CommandLineRunner triggered. Spawning V2 Sync thread...");
        new Thread(() -> {
            try {
                Thread.sleep(5000);
                apiResourceService.safeSync();
            } catch (Exception e) {
                System.err.println("[BOOT ERROR] Background sync failed: " + e.getMessage());
            }
        }, "UniversalSyncV2-Thread").start();
    }
}
