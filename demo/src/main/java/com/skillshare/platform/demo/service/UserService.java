package com.skillshare.platform.demo.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.skillshare.platform.demo.dto.UserDTO;
import com.skillshare.platform.demo.exception.ResourceNotFoundException;
import com.skillshare.platform.demo.model.User;
import com.skillshare.platform.demo.repository.StoryRepository;
import com.skillshare.platform.demo.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final StoryRepository storyRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
    }

    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        boolean hasActiveStories = !storyRepository.findByUserIdAndExpiresAtAfterOrderByCreatedAtDesc(
                id, LocalDateTime.now()).isEmpty();
        return UserDTO.fromUser(user, false, hasActiveStories);
    }

    public UserDTO getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        boolean hasActiveStories = !storyRepository.findByUserIdAndExpiresAtAfterOrderByCreatedAtDesc(
                user.getId(), LocalDateTime.now()).isEmpty();
        return UserDTO.fromUser(user, false, hasActiveStories);
    }

    public List<UserDTO> searchUsers(String query) {
        LocalDateTime now = LocalDateTime.now();
        return userRepository.searchUsers(query).stream()
                .map(user -> {
                    boolean hasActiveStories = !storyRepository.findByUserIdAndExpiresAtAfterOrderByCreatedAtDesc(
                            user.getId(), now).isEmpty();
                    return UserDTO.fromUser(user, false, hasActiveStories);
                })
                .collect(Collectors.toList());
    }

    public List<UserDTO> getSuggestedUsers(int limit) {
        LocalDateTime now = LocalDateTime.now();
        return userRepository.findTopUsersByFollowers(limit).stream()
                .map(user -> {
                    boolean hasActiveStories = !storyRepository.findByUserIdAndExpiresAtAfterOrderByCreatedAtDesc(
                            user.getId(), now).isEmpty();
                    return UserDTO.fromUser(user, false, hasActiveStories);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDTO updateUser(Long id, UserDTO userDTO) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setName(userDTO.getName());
        user.setBio(userDTO.getBio());
        user.setLocation(userDTO.getLocation());
        user.setAvatarUrl(userDTO.getAvatarUrl());

        User updatedUser = userRepository.save(user);
        boolean hasActiveStories = !storyRepository.findByUserIdAndExpiresAtAfterOrderByCreatedAtDesc(
                id, LocalDateTime.now()).isEmpty();
        return UserDTO.fromUser(updatedUser, false, hasActiveStories);
    }

    @Transactional
    public void followUser(Long currentUserId, Long targetUserId) {
        if (currentUserId.equals(targetUserId)) {
            throw new IllegalArgumentException("You cannot follow yourself");
        }

        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Target user not found"));

        targetUser.getFollowers().add(currentUser);
        userRepository.save(targetUser);
    }

    @Transactional
    public void unfollowUser(Long currentUserId, Long targetUserId) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Target user not found"));

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
        
        LocalDateTime now = LocalDateTime.now();
        return user.getFollowers().stream()
                .map(follower -> {
                    boolean hasActiveStories = !storyRepository.findByUserIdAndExpiresAtAfterOrderByCreatedAtDesc(
                            follower.getId(), now).isEmpty();
                    return UserDTO.fromUser(follower, false, hasActiveStories);
                })
                .collect(Collectors.toList());
    }

    public List<UserDTO> getFollowing(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        LocalDateTime now = LocalDateTime.now();
        return user.getFollowing().stream()
                .map(following -> {
                    boolean hasActiveStories = !storyRepository.findByUserIdAndExpiresAtAfterOrderByCreatedAtDesc(
                            following.getId(), now).isEmpty();
                    return UserDTO.fromUser(following, false, hasActiveStories);
                })
                .collect(Collectors.toList());
    }
}
