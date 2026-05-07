package com.tylersoft.eclectics.config;

import com.fasterxml.jackson.databind.Module;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import com.fasterxml.jackson.datatype.hibernate6.Hibernate6Module;

@Configuration
public class JacksonConfig {

    @Bean
    public Module hibernateModule() {
        Hibernate6Module module = new Hibernate6Module();

        // IMPORTANT FIXES
        module.disable(Hibernate6Module.Feature.USE_TRANSIENT_ANNOTATION);
        module.disable(Hibernate6Module.Feature.FORCE_LAZY_LOADING);

        // CRITICAL: prevents proxy serialization crashes
        module.enable(Hibernate6Module.Feature.SERIALIZE_IDENTIFIER_FOR_LAZY_NOT_LOADED_OBJECTS);

        return module;
    }
}
