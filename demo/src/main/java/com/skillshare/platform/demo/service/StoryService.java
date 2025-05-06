package com.skillshare.platform.demo.service;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.skillshare.platform.demo.dto.StoryDTO;
import com.skillshare.platform.demo.dto.request.StoryRequest;
import com.skillshare.platform.demo.exception.ResourceNotFoundException;
import com.skillshare.platform.demo.model.MediaType;
import com.skillshare.platform.demo.model.Story;
import com.skillshare.platform.demo.model.User;
import com.skillshare.platform.demo.repository.StoryRepository;
import com.skillshare.platform.demo.repository.UserRepository;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StoryService {

    private final StoryRepository storyRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    public List<StoryDTO> getUserStories(Long userId, Long currentUserId) {
        List<Story> stories = storyRepository.findByUserIdAndExpiresAtAfterOrderByCreatedAtDesc(
                userId, LocalDateTime.now());
        
        return stories.stream()
                .map(story -> mapStoryToDTO(story, currentUserId))
                .collect(Collectors.toList());
    }

    public List<StoryDTO> getFeedStories(Long userId) {
        List<Story> stories = storyRepository.findStoriesFromFollowedUsers(userId, LocalDateTime.now());
        
        return stories.stream()
                .map(story -> mapStoryToDTO(story, userId))
                .collect(Collectors.toList());
    }

    @Transactional
    public StoryDTO createStory(StoryRequest request, MultipartFile mediaFile, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        String mediaUrl;
        try {
            mediaUrl = fileStorageService.storeFile(mediaFile);
        } catch (IOException e) {
            throw new RuntimeException("Could not store media file", e);
        }

        MediaType mediaType = determineMediaType(mediaFile.getContentType());

        Story story = Story.builder()
                .user(user)
                .content(request.getContent())
                .mediaUrl(mediaUrl)
                .mediaType(mediaType)
                .build();

        Story savedStory = storyRepository.save(story);
        return StoryDTO.fromStory(savedStory);
    }

    @Transactional
    public void viewStory(Long storyId, Long userId) {
        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new ResourceNotFoundException("Story not found with id: " + storyId));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        if (!story.getViewers().contains(user)) {
            story.getViewers().add(user);
            storyRepository.save(story);
        }
    }

    @Transactional
    public void deleteStory(Long storyId, Long userId) {
        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new ResourceNotFoundException("Story not found with id: " + storyId));
        
        if (!story.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You are not authorized to delete this story");
        }
        
        try {
            fileStorageService.deleteFile(story.getMediaUrl());
        } catch (IOException e) {
            // Log error but continue with deletion
            System.err.println("Error deleting file: " + e.getMessage());
        }
        
        storyRepository.delete(story);
    }

    @Scheduled(fixedRate = 3600000) // Run every hour
    @Transactional
    public void cleanupExpiredStories() {
        List<Story> expiredStories = storyRepository.findByExpiresAtBefore(LocalDateTime.now());
        
        for (Story story : expiredStories) {
            try {
                fileStorageService.deleteFile(story.getMediaUrl());
            } catch (IOException e) {
                // Log error but continue with deletion
                System.err.println("Error deleting file: " + e.getMessage());
            }
        }
        
        storyRepository.deleteAll(expiredStories);
    }

    private MediaType determineMediaType(String contentType) {
        if (contentType != null) {
            if (contentType.startsWith("image/")) {
                return MediaType.IMAGE;
            } else if (contentType.startsWith("video/")) {
                return MediaType.VIDEO;
            }
        }
        return MediaType.IMAGE; // Default to image
    }

    private StoryDTO mapStoryToDTO(Story story, Long currentUserId) {
        boolean viewed = false;
        if (currentUserId != null) {
            viewed = story.getViewers().stream()
                    .anyMatch(viewer -> viewer.getId().equals(currentUserId));
        }
        return StoryDTO.fromStory(story, viewed);
    }
}
