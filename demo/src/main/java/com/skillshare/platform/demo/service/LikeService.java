package com.skillshare.platform.demo.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.skillshare.platform.demo.exception.ResourceNotFoundException;
import com.skillshare.platform.demo.model.Like;
import com.skillshare.platform.demo.model.NotificationType;
import com.skillshare.platform.demo.model.Post;
import com.skillshare.platform.demo.model.User;
import com.skillshare.platform.demo.repository.LikeRepository;
import com.skillshare.platform.demo.repository.PostRepository;
import com.skillshare.platform.demo.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class LikeService {

    private final LikeRepository likeRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public void likePost(Long postId, Long userId) {
        if (likeRepository.existsByUserIdAndPostId(userId, postId)) {
            return; // Already liked
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + postId));

        Like like = Like.builder()
                .user(user)
                .post(post)
                .build();

        likeRepository.save(like);

        // Send notification to post owner if it's not the same user
        if (!post.getUser().getId().equals(userId)) {
            notificationService.createNotification(
                    post.getUser().getId(),
                    user.getUsername() + " liked your post",
                    NotificationType.LIKE,
                    post.getId()
            );
        }
    }

    @Transactional
    public void unlikePost(Long postId, Long userId) {
        likeRepository.findByUserIdAndPostId(userId, postId)
                .ifPresent(likeRepository::delete);
    }

    public long getLikesCount(Long postId) {
        return likeRepository.countByPostId(postId);
    }

    public boolean isPostLikedByUser(Long postId, Long userId) {
        return likeRepository.existsByUserIdAndPostId(userId, postId);
    }
}
