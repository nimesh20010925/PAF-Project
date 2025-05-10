package com.skillshare.platform.demo.controller;

import com.skillshare.platform.demo.dto.StoryDTO;
import com.skillshare.platform.demo.dto.request.StoryRequest;
import com.skillshare.platform.demo.dto.response.ApiResponse;
import com.skillshare.platform.demo.security.CurrentUser;
import com.skillshare.platform.demo.service.StoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/stories")
@RequiredArgsConstructor
public class StoryController {

    private final StoryService storyService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<StoryDTO>>> getAllStories(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @CurrentUser Long currentUserId) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<StoryDTO> stories = storyService.getAllStories(pageable, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(stories));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<StoryDTO>>> getUserStories(
            @PathVariable Long userId,
            @CurrentUser Long currentUserId) {
        List<StoryDTO> stories = storyService.getUserStories(userId, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(stories));
    }

    @GetMapping("/feed")
    public ResponseEntity<ApiResponse<List<StoryDTO>>> getFeedStories(@CurrentUser Long currentUserId) {
        List<StoryDTO> stories = storyService.getFeedStories(currentUserId);
        return ResponseEntity.ok(ApiResponse.success(stories));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<StoryDTO>> createStory(
            @RequestPart("story") StoryRequest storyRequest,
            @RequestPart("media") MultipartFile mediaFile,
            @CurrentUser Long currentUserId) {
        StoryDTO createdStory = storyService.createStory(storyRequest, mediaFile, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Story created successfully", createdStory));
    }

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<StoryDTO>> uploadStory(
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "content", required = false) String content,
            @RequestParam("media") MultipartFile mediaFile,
            @CurrentUser Long currentUserId) {
        StoryRequest storyRequest = StoryRequest.builder().content(content).build();
        StoryDTO createdStory = storyService.createStory(storyRequest, mediaFile, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Story created successfully", createdStory));
    }

    @PostMapping("/{id}/view")
    public ResponseEntity<ApiResponse<Void>> viewStory(
            @PathVariable Long id,
            @CurrentUser Long currentUserId) {
        storyService.viewStory(id, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Story viewed", null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteStory(
            @PathVariable Long id,
            @CurrentUser Long currentUserId) {
        storyService.deleteStory(id, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Story deleted successfully", null));
    }
}
