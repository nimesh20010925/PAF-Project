package com.skillshare.platform.demo.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.skillshare.platform.demo.dto.StoryDTO;
import com.skillshare.platform.demo.dto.request.StoryRequest;
import com.skillshare.platform.demo.dto.response.ApiResponse;
import com.skillshare.platform.demo.security.CurrentUser;
import com.skillshare.platform.demo.service.StoryService;

import java.util.List;

@RestController
@RequestMapping("/api/stories")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Add this for development to avoid CORS issues
public class StoryController {

    private final StoryService storyService;

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
        
        // Log the received data
        System.out.println("Received story request: " + storyRequest);
        System.out.println("Received media file: " + (mediaFile != null ? 
                            mediaFile.getOriginalFilename() + ", " + 
                            mediaFile.getContentType() + ", " + 
                            mediaFile.getSize() + " bytes" : "null"));
        
        StoryDTO createdStory = storyService.createStory(storyRequest, mediaFile, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Story created successfully", createdStory));
    }
    
    // Add a simpler endpoint for story creation
    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<StoryDTO>> uploadStory(
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "content", required = false) String content,
            @RequestParam("media") MultipartFile media,
            @CurrentUser Long currentUserId) {
        
        System.out.println("Received story upload with title: " + title);
        System.out.println("Received story upload with content: " + content);
        System.out.println("Received media file: " + (media != null ? 
                            media.getOriginalFilename() + ", " + 
                            media.getContentType() + ", " + 
                            media.getSize() + " bytes" : "null"));
        
        // Create a StoryRequest object
        StoryRequest storyRequest = new StoryRequest();
        storyRequest.setTitle(title);
        storyRequest.setContent(content);
        
        // Use the existing service method
        StoryDTO createdStory = storyService.createStory(storyRequest, media, currentUserId);
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
