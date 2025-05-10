package com.skillshare.platform.demo.service;

import com.skillshare.platform.demo.dto.StoryDTO;
import com.skillshare.platform.demo.dto.request.StoryRequest;
import com.skillshare.platform.demo.exception.ResourceNotFoundException;
import com.skillshare.platform.demo.model.MediaType;
import com.skillshare.platform.demo.model.Story;
import com.skillshare.platform.demo.model.User;
import com.skillshare.platform.demo.repository.StoryRepository;
import com.skillshare.platform.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StoryService {

    private static final Logger logger = LoggerFactory.getLogger(StoryService.class);

    private final StoryRepository storyRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    public Page<StoryDTO> getAllStories(Pageable pageable, Long currentUserId) {
        Page<Story> stories = storyRepository.findByExpiresAtAfter(LocalDateTime.now(), pageable);
        return stories.map(story -> mapStoryToDTO(story, currentUserId));
    }

    public List<StoryDTO> getUserStories(Long userId, Long currentUserId) {
        List<Story> stories = storyRepository.findByUserIdAndExpiresAtAfterOrderByCreatedAtDesc(userId, LocalDateTime.now());
        return stories.stream().map(story -> mapStoryToDTO(story, currentUserId)).collect(Collectors.toList());
    }

    public List<StoryDTO> getFeedStories(Long userId) {
        List<Story> stories = storyRepository.findStoriesFromFollowedUsers(userId, LocalDateTime.now());
        return stories.stream().map(story -> mapStoryToDTO(story, userId)).collect(Collectors.toList());
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
                .viewers(new HashSet<>())
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusHours(24))
                .build();

        return StoryDTO.fromStory(storyRepository.save(story));
    }

    @Transactional
    public void viewStory(Long storyId, Long userId) {
        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new ResourceNotFoundException("Story not found with id: " + storyId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (story.getViewers() == null) {
            story.setViewers(new HashSet<>());
        }

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
            logger.error("Error deleting file: {}", e.getMessage());
        }

        storyRepository.delete(story);
    }

    @Scheduled(fixedRate = 3600000)
    @Transactional
    public void cleanupExpiredStories() {
        List<Story> expiredStories = storyRepository.findByExpiresAtBefore(LocalDateTime.now());
        for (Story story : expiredStories) {
            try {
                fileStorageService.deleteFile(story.getMediaUrl());
            } catch (IOException e) {
                logger.error("Error deleting file during cleanup: {}", e.getMessage());
            }
        }
        storyRepository.deleteAll(expiredStories);
    }

    private MediaType determineMediaType(String contentType) {
        if (contentType != null) {
            if (contentType.startsWith("image/")) return MediaType.IMAGE;
            else if (contentType.startsWith("video/")) return MediaType.VIDEO;
        }
        return MediaType.IMAGE;
    }

    private StoryDTO mapStoryToDTO(Story story, Long currentUserId) {
        boolean viewed = story.getViewers() != null &&
                         currentUserId != null &&
                         story.getViewers().stream().anyMatch(u -> u.getId().equals(currentUserId));
        return StoryDTO.fromStory(story, viewed);
    }
}
