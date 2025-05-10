package com.skillshare.platform.demo.service;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.skillshare.platform.demo.dto.UserDTO;
import com.skillshare.platform.demo.exception.ResourceNotFoundException;
import com.skillshare.platform.demo.model.User;
import com.skillshare.platform.demo.repository.StoryRepository;
import com.skillshare.platform.demo.repository.UserRepository;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final StoryRepository storyRepository;

    // The root upload directory (change this to your desired location)
    private static final String UPLOAD_ROOT_DIR = "/Users/pereraw.b.n/PAF project/uploads/";

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        logger.info("Attempting to load user by username: {}", username);
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
    }

    public UserDTO getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        boolean hasActiveStories = hasActiveStories(user.getId());
        return UserDTO.fromUser(user, false, hasActiveStories);
    }

    public List<UserDTO> searchUsers(String query) {
        return userRepository.searchUsers(query).stream()
                .map(user -> UserDTO.fromUser(user, false, hasActiveStories(user.getId())))
                .collect(Collectors.toList());
    }

    public List<UserDTO> getSuggestedUsers(int limit) {
        return userRepository.findTopUsersByFollowers(limit).stream()
                .map(user -> UserDTO.fromUser(user, false, hasActiveStories(user.getId())))
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDTO updateUser(Long id, UserDTO userDTO, MultipartFile profileImage, MultipartFile coverImage) throws IOException {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        // Update user fields
        if (userDTO.getUsername() != null && !userDTO.getUsername().isEmpty())
            user.setUsername(userDTO.getUsername());

        if (userDTO.getName() != null)
            user.setName(userDTO.getName());

        if (userDTO.getEmail() != null && !userDTO.getEmail().isEmpty())
            user.setEmail(userDTO.getEmail());

        if (userDTO.getBio() != null)
            user.setBio(userDTO.getBio());

        if (userDTO.getLocation() != null)
            user.setLocation(userDTO.getLocation());

        // Handle profile image upload
        if (profileImage != null && !profileImage.isEmpty()) {
            String profileImageUrl = uploadFile(profileImage, "profile-images");
            user.setAvatarUrl(profileImageUrl);
        }

        // Handle cover image upload
        if (coverImage != null && !coverImage.isEmpty()) {
            String coverImageUrl = uploadFile(coverImage, "cover-images");
            user.setCoverImage(coverImageUrl);
        }

        // Save updated user
        user = userRepository.save(user);
        return UserDTO.fromUser(user, false, hasActiveStories(user.getId()));
    }

    private String uploadFile(MultipartFile file, String folder) throws IOException {
        // Define the path to store the files
        String uploadDir = UPLOAD_ROOT_DIR + folder + "/";
        Path path = Paths.get(uploadDir);

        // Log the upload directory for debugging purposes
        logger.info("Upload directory: {}", uploadDir);

        // Check if directory exists, if not create it
        if (!Files.exists(path)) {
            Files.createDirectories(path);
            logger.info("Created directory: {}", uploadDir);
        }

        // Generate a unique filename using current timestamp
        String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filePath = path.resolve(filename);

        // Log the file path for debugging purposes
        logger.info("Saving file to: {}", filePath);

        // Save the file to the directory
        file.transferTo(filePath.toFile());

        // Return the relative URL for the uploaded file
        return "/uploads/" + folder + "/" + filename;
    }

    @Transactional
    public void followUser(Long currentUserId, Long targetUserId) {
        if (currentUserId.equals(targetUserId))
            throw new IllegalArgumentException("You cannot follow yourself");

        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Target user not found"));

        // Add current user to target user's followers list
        targetUser.getFollowers().add(currentUser);
        userRepository.save(targetUser);
    }

    @Transactional
    public void unfollowUser(Long currentUserId, Long targetUserId) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Target user not found"));

        // Remove current user from target user's followers list
        targetUser.getFollowers().remove(currentUser);
        userRepository.save(targetUser);
    }

    public boolean isFollowing(Long currentUserId, Long targetUserId) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));
        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Target user not found"));
        return targetUser.getFollowers().contains(currentUser);
    }

    public List<UserDTO> getFollowers(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return user.getFollowers().stream()
                .map(follower -> UserDTO.fromUser(follower, false, hasActiveStories(follower.getId())))
                .collect(Collectors.toList());
    }

    public List<UserDTO> getFollowing(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return user.getFollowing().stream()
                .map(following -> UserDTO.fromUser(following, false, hasActiveStories(following.getId())))
                .collect(Collectors.toList());
    }

    private boolean hasActiveStories(Long userId) {
        return !storyRepository.findByUserIdAndExpiresAtAfterOrderByCreatedAtDesc(
                userId, LocalDateTime.now()).isEmpty();
    }
}
