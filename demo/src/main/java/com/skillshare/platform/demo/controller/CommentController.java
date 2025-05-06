package com.skillshare.platform.demo.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.skillshare.platform.demo.dto.CommentDTO;
import com.skillshare.platform.demo.dto.request.CommentRequest;
import com.skillshare.platform.demo.dto.response.ApiResponse;
import com.skillshare.platform.demo.security.CurrentUser;
import com.skillshare.platform.demo.service.CommentService;

@RestController
@RequestMapping("/api/posts/{postId}/comments")
@RequiredArgsConstructor
public class CommentController {
    private final CommentService commentService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<CommentDTO>>> getCommentsByPostId(
            @PathVariable Long postId,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<CommentDTO> comments = commentService.getCommentsByPostId(postId, pageable);
        return ResponseEntity.ok(ApiResponse.success(comments));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CommentDTO>> createComment(
            @PathVariable Long postId,
            @Valid @RequestBody CommentRequest commentRequest,
            @CurrentUser Long currentUserId) {
        CommentDTO createdComment = commentService.createComment(postId, commentRequest, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Comment created successfully", createdComment));
    }

    @PutMapping("/{id}")
    @PreAuthorize("@commentService.getCommentById(#id).user.id == authentication.principal.id")
    public ResponseEntity<ApiResponse<CommentDTO>> updateComment(
            @PathVariable Long postId,
            @PathVariable Long id,
            @Valid @RequestBody CommentRequest commentRequest,
            @CurrentUser Long currentUserId) {
        CommentDTO updatedComment = commentService.updateComment(id, commentRequest, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Comment updated successfully", updatedComment));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
            @PathVariable Long postId,
            @PathVariable Long id,
            @CurrentUser Long currentUserId) {
        commentService.deleteComment(id, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Comment deleted successfully", null));
    }

}
