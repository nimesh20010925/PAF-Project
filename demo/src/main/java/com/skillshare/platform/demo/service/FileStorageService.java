package com.skillshare.platform.demo.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {
    private static final Logger logger = LoggerFactory.getLogger(FileStorageService.class);

    private final Path fileStorageLocation;
    private final String uploadBaseUrl;

    public FileStorageService(
            @Value("${file.upload-dir:./uploads}") String uploadDir,
            @Value("${file.upload-url:uploads}") String uploadUrl) {
        
        logger.info("Initializing FileStorageService with uploadDir={}, uploadUrl={}", uploadDir, uploadUrl);
        
        this.fileStorageLocation = Paths.get(uploadDir)
                .toAbsolutePath().normalize();
        this.uploadBaseUrl = uploadUrl;

        try {
            // Create directory if it doesn't exist
            File directory = this.fileStorageLocation.toFile();
            if (!directory.exists()) {
                logger.info("Upload directory does not exist, creating: {}", this.fileStorageLocation);
                if (directory.mkdirs()) {
                    logger.info("Successfully created directory: {}", this.fileStorageLocation);
                } else {
                    logger.error("Failed to create directory: {}", this.fileStorageLocation);
                    throw new RuntimeException("Could not create the directory where the uploaded files will be stored");
                }
            } else {
                logger.info("Upload directory already exists: {}", this.fileStorageLocation);
                
                // Check if directory is writable
                if (!directory.canWrite()) {
                    logger.error("Upload directory is not writable: {}", this.fileStorageLocation);
                    throw new RuntimeException("Upload directory is not writable: " + this.fileStorageLocation);
                }
            }
        } catch (Exception ex) {
            logger.error("Could not create the directory where the uploaded files will be stored", ex);
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored", ex);
        }
    }

    public String storeFile(MultipartFile file) throws IOException {
        logger.info("Storing file: {}, size: {}", file.getOriginalFilename(), file.getSize());
        
        // Normalize file name
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
        
        // Check if the file's name contains invalid characters
        if (originalFileName.contains("..")) {
            logger.error("Filename contains invalid path sequence: {}", originalFileName);
            throw new RuntimeException("Filename contains invalid path sequence " + originalFileName);
        }
        
        // Generate a unique file name to prevent conflicts
        String fileExtension = "";
        if (originalFileName.contains(".")) {
            fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        String fileName = UUID.randomUUID().toString() + fileExtension;
        
        // Copy file to the target location
        Path targetLocation = this.fileStorageLocation.resolve(fileName);
        logger.info("Copying file to: {}", targetLocation);
        
        try {
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            logger.info("File stored successfully at: {}", targetLocation);
            
            // Return the URL path to access the file
            String fileUrl = "/" + uploadBaseUrl + "/" + fileName;
            logger.info("File URL: {}", fileUrl);
            return fileUrl;
        } catch (IOException e) {
            logger.error("Failed to store file: {}", e.getMessage(), e);
            throw e;
        }
    }
    
    public void deleteFile(String fileName) throws IOException {
        logger.info("Deleting file: {}", fileName);
        
        // Extract just the filename from the full path if needed
        if (fileName.startsWith("/" + uploadBaseUrl + "/")) {
            fileName = fileName.substring(("/" + uploadBaseUrl + "/").length());
        }
        
        Path filePath = this.fileStorageLocation.resolve(fileName);
        logger.info("Deleting file at: {}", filePath);
        
        try {
            boolean deleted = Files.deleteIfExists(filePath);
            logger.info("File deletion result: {}", deleted ? "deleted" : "file not found");
        } catch (IOException e) {
            logger.error("Failed to delete file: {}", e.getMessage(), e);
            throw e;
        }
    }
}
