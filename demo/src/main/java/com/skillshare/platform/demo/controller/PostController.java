package com.skillshare.platform.demo.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.skillshare.platform.demo.dto.PostDTO;
import com.skillshare.platform.demo.dto.request.PostRequest;
import com.skillshare.platform.demo.dto.response.ApiResponse;
import com.skillshare.platform.demo.security.CurrentUser;
import com.skillshare.platform.demo.service.PostService;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<PostDTO>>> getAllPosts(
            @PageableDefault(size = 10) Pageable pageable,
            @CurrentUser Long currentUserId) {
        Page<PostDTO> posts = postService.getAllPosts(pageable, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(posts));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PostDTO>> getPostById(
            @PathVariable Long id,
            @CurrentUser Long currentUserId) {
        PostDTO post = postService.getPostById(id, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(post));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<Page<PostDTO>>> getPostsByUserId(
            @PathVariable Long userId,
            @PageableDefault(size = 10) Pageable pageable,
            @CurrentUser Long currentUserId) {
        Page<PostDTO> posts = postService.getPostsByUserId(userId, pageable, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(posts));
    }

    @GetMapping("/feed")
    public ResponseEntity<ApiResponse<Page<PostDTO>>> getFeedPosts(
            @PageableDefault(size = 10) Pageable pageable,
            @CurrentUser Long currentUserId) {
        Page<PostDTO> posts = postService.getFeedPosts(currentUserId, pageable);
        return ResponseEntity.ok(ApiResponse.success(posts));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<PostDTO>>> searchPosts(
            @RequestParam String query,
            @PageableDefault(size = 10) Pageable pageable,
            @CurrentUser Long currentUserId) {
        Page<PostDTO> posts = postService.searchPosts(query, pageable, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(posts));
    }

    @PostMapping("/create")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<PostDTO>> createPost(
            @Valid @RequestPart("post") PostRequest postRequest,
            @RequestPart(value = "files", required = false) List<MultipartFile> files,
            @CurrentUser Long currentUserId) {
        PostDTO createdPost = postService.createPost(postRequest, currentUserId, files);
        return ResponseEntity.ok(ApiResponse.success("Post created successfully", createdPost));
    }

    @PutMapping("/{id}")
    @PreAuthorize("@postService.getPostById(#id, authentication.principal.id).user.id == authentication.principal.id")
    public ResponseEntity<ApiResponse<PostDTO>> updatePost(
            @PathVariable Long id,
            @Valid @RequestBody PostRequest postRequest,
            @CurrentUser Long currentUserId) {
        PostDTO updatedPost = postService.updatePost(id, postRequest, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Post updated successfully", updatedPost));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@postService.getPostById(#id, authentication.principal.id).user.id == authentication.principal.id")
    public ResponseEntity<ApiResponse<Void>> deletePost(
            @PathVariable Long id,
            @CurrentUser Long currentUserId) {
        postService.deletePost(id, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Post deleted successfully", null));
    }

}
