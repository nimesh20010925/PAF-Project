package com.skillshare.platform.demo.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.skillshare.platform.demo.dto.response.ApiResponse;
import com.skillshare.platform.demo.security.CurrentUser;
import com.skillshare.platform.demo.service.LikeService;

@RestController
@RequestMapping("/api/posts/{postId}/likes")
@RequiredArgsConstructor
public class LikeController {

    private final LikeService likeService;

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> likePost(
            @PathVariable Long postId,
            @CurrentUser Long currentUserId) {
        likeService.likePost(postId, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Post liked successfully", null));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> unlikePost(
            @PathVariable Long postId,
            @CurrentUser Long currentUserId) {
        likeService.unlikePost(postId, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Post unliked successfully", null));
    }

    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Long>> getLikesCount(@PathVariable Long postId) {
        long likesCount = likeService.getLikesCount(postId);
        return ResponseEntity.ok(ApiResponse.success(likesCount));
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<Boolean>> isPostLikedByUser(
            @PathVariable Long postId,
            @CurrentUser Long currentUserId) {
        boolean isLiked = likeService.isPostLikedByUser(postId, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(isLiked));
    }

}
