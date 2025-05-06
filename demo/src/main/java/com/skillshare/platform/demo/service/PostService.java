package com.skillshare.platform.demo.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.skillshare.platform.demo.dto.PostDTO;
import com.skillshare.platform.demo.dto.request.PostRequest;
import com.skillshare.platform.demo.exception.ResourceNotFoundException;
import com.skillshare.platform.demo.model.Media;
import com.skillshare.platform.demo.model.MediaType;
import com.skillshare.platform.demo.model.Post;
import com.skillshare.platform.demo.model.User;
import com.skillshare.platform.demo.repository.LikeRepository;
import com.skillshare.platform.demo.repository.MediaRepository;
import com.skillshare.platform.demo.repository.PostRepository;
import com.skillshare.platform.demo.repository.UserRepository;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final MediaRepository mediaRepository;
    private final LikeRepository likeRepository;
    private final FileStorageService fileStorageService;
    private final NotificationService notificationService;

    public Page<PostDTO> getAllPosts(Pageable pageable, Long currentUserId) {
        Page<Post> posts = postRepository.findAll(pageable);
        return posts.map(post -> mapPostToDTO(post, currentUserId));
    }

    public PostDTO getPostById(Long id, Long currentUserId) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + id));
        return mapPostToDTO(post, currentUserId);
    }

    public Page<PostDTO> getPostsByUserId(Long userId, Pageable pageable, Long currentUserId) {
        Page<Post> posts = postRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return posts.map(post -> mapPostToDTO(post, currentUserId));
    }

    public Page<PostDTO> getFeedPosts(Long userId, Pageable pageable) {
        Page<Post> posts = postRepository.findFeedPostsByUserId(userId, pageable);
        return posts.map(post -> mapPostToDTO(post, userId));
    }

    public Page<PostDTO> searchPosts(String query, Pageable pageable, Long currentUserId) {
        Page<Post> posts = postRepository.searchPosts(query, pageable);
        return posts.map(post -> mapPostToDTO(post, currentUserId));
    }

    @Transactional
    public PostDTO createPost(PostRequest postRequest, Long userId, List<MultipartFile> files) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Post post = Post.builder()
                .user(user)
                .content(postRequest.getContent())
                .type(postRequest.getType())
                .media(new ArrayList<>())
                .build();

        Post savedPost = postRepository.save(post);

        if (files != null && !files.isEmpty()) {
            processAndSaveMedia(savedPost, files);
        }

        return mapPostToDTO(savedPost, userId);
    }

    @Transactional
    public PostDTO updatePost(Long id, PostRequest postRequest, Long userId) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + id));

        if (!post.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You are not authorized to update this post");
        }

        post.setContent(postRequest.getContent());
        post.setType(postRequest.getType());

        Post updatedPost = postRepository.save(post);
        return mapPostToDTO(updatedPost, userId);
    }

    @Transactional
    public void deletePost(Long id, Long userId) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + id));

        if (!post.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You are not authorized to delete this post");
        }

        // Delete associated media files
        mediaRepository.findByPostId(id).forEach(media -> {
            try {
                fileStorageService.deleteFile(media.getUrl());
            } catch (IOException e) {
                // Log error but continue with deletion
                System.err.println("Error deleting file: " + e.getMessage());
            }
        });

        postRepository.delete(post);
    }

    private void processAndSaveMedia(Post post, List<MultipartFile> files) {
        // Limit to 3 files
        List<MultipartFile> limitedFiles = files.size() > 3 ? files.subList(0, 3) : files;

        for (MultipartFile file : limitedFiles) {
            try {
                String fileUrl = fileStorageService.storeFile(file);
                MediaType mediaType = determineMediaType(file.getContentType());

                Media media = Media.builder()
                        .post(post)
                        .url(fileUrl)
                        .type(mediaType)
                        .build();

                mediaRepository.save(media);
                post.getMedia().add(media);
            } catch (IOException e) {
                throw new RuntimeException("Could not store file", e);
            }
        }
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

    private PostDTO mapPostToDTO(Post post, Long currentUserId) {
        boolean isLiked = false;
        if (currentUserId != null) {
            isLiked = likeRepository.existsByUserIdAndPostId(currentUserId, post.getId());
        }
        return PostDTO.fromPost(post, isLiked);
    }
}
