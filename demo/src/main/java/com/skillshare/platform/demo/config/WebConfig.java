package com.skillshare.platform.demo.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private static final Logger logger = LoggerFactory.getLogger(WebConfig.class);

    @Value("${file.upload-dir:/path/to/your/external/uploads/directory/}") // Default path is set to an external folder
    private String uploadDir;

    @Value("${file.upload-url:uploads}")
    private String uploadUrl;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .maxAge(3600);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Map the uploaded files to be accessible via URL
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        String uploadAbsolutePath = uploadPath.toString();

        logger.info("Configuring resource handler for uploads: {} -> {}", "/" + uploadUrl + "/**", "file:" + uploadAbsolutePath + "/");

        registry.addResourceHandler("/" + uploadUrl + "/**")
                .addResourceLocations("file:" + uploadAbsolutePath + "/");

        logger.info("Resource handler configured successfully");
    }
}
