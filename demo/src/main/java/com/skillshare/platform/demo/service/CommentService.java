package com.skillshare.platform.demo.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.skillshare.platform.demo.dto.CommentDTO;
import com.skillshare.platform.demo.dto.request.CommentRequest;
import com.skillshare.platform.demo.exception.ResourceNotFoundException;
import com.skillshare.platform.demo.model.Comment;
import com.skillshare.platform.demo.model.NotificationType;
import com.skillshare.platform.demo.model.Post;
import com.skillshare.platform.demo.model.User;
import com.skillshare.platform.demo.repository.CommentRepository;
import com.skillshare.platform.demo.repository.PostRepository;
import com.skillshare.platform.demo.repository.UserRepository;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public Page<CommentDTO> getCommentsByPostId(Long postId, Pageable pageable) {
        Page<Comment> comments = commentRepository.findByPostIdOrderByCreatedAtDesc(postId, pageable);
        return comments.map(CommentDTO::fromComment);
    }

    @Transactional
    public CommentDTO createComment(Long postId, CommentRequest commentRequest, Long userId) {
        log.info("Creating comment for post {} by user {}", postId, userId);
        
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
            log.info("Found user: {}", user.getUsername());

            Post post = postRepository.findById(postId)
                    .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + postId));
            log.info("Found post by user: {}", post.getUser().getUsername());

            Comment comment = Comment.builder()
                    .user(user)
                    .post(post)
                    .content(commentRequest.getContent())
                    .build();

            Comment savedComment = commentRepository.save(comment);
            log.info("Comment saved successfully with id: {}", savedComment.getId());

            // Send notification to post owner if it's not the same user
            if (!post.getUser().getId().equals(userId)) {
                try {
                    log.info("Attempting to create notification for user: {}", post.getUser().getId());
                    notificationService.createNotification(
                            post.getUser().getId(),
                            user.getUsername() + " commented on your post",
                            NotificationType.COMMENT,
                            post.getId()
                    );
                    log.info("Notification created successfully");
                } catch (Exception e) {
                    // Log the error but don't fail the comment creation
                    log.error("Failed to create notification: {}", e.getMessage(), e);
                }
            }

            return CommentDTO.fromComment(savedComment);
        } catch (Exception e) {
            log.error("Error creating comment: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Transactional
    public CommentDTO updateComment(Long id, CommentRequest commentRequest, Long userId) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + id));

        // Check if the user is the comment owner
        if (!comment.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You are not authorized to update this comment");
        }

        comment.setContent(commentRequest.getContent());
        Comment updatedComment = commentRepository.save(comment);
        return CommentDTO.fromComment(updatedComment);
    }

    @Transactional
    public void deleteComment(Long id, Long userId) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + id));

        // Check if the user is the comment owner or the post owner
        boolean isCommentOwner = comment.getUser().getId().equals(userId);
        boolean isPostOwner = comment.getPost().getUser().getId().equals(userId);
        
        if (!isCommentOwner && !isPostOwner) {
            throw new IllegalArgumentException("You are not authorized to delete this comment");
        }

        commentRepository.delete(comment);
    }

    public CommentDTO getCommentById(Long id) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + id));
        return CommentDTO.fromComment(comment);
    }
}
