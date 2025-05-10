package com.skillshare.platform.demo.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.skillshare.platform.demo.dto.UserDTO;
import com.skillshare.platform.demo.dto.response.ApiResponse;
import com.skillshare.platform.demo.security.CurrentUser;
import com.skillshare.platform.demo.service.UserService;

import java.io.IOException;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{username}")
    public ResponseEntity<ApiResponse<UserDTO>> getUserByUsername(
            @PathVariable String username,
            @CurrentUser Long currentUserId) {
        UserDTO userDTO = userService.getUserByUsername(username);
        userDTO.setFollowing(userService.isFollowing(currentUserId, userDTO.getId()));
        return ResponseEntity.ok(ApiResponse.success(userDTO));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<UserDTO>>> searchUsers(
            @RequestParam String query,
            @CurrentUser Long currentUserId) {
        List<UserDTO> users = userService.searchUsers(query);
        users.forEach(user -> user.setFollowing(userService.isFollowing(currentUserId, user.getId())));
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/suggested")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getSuggestedUsers(
            @RequestParam(defaultValue = "5") int limit,
            @CurrentUser Long currentUserId) {
        try {
            List<UserDTO> users = userService.getSuggestedUsers(limit);
            if (users == null || users.isEmpty()) {
                return ResponseEntity.status(404).body(ApiResponse.error("No suggested users found"));
            }
            users.forEach(user -> user.setFollowing(userService.isFollowing(currentUserId, user.getId())));
            return ResponseEntity.ok(ApiResponse.success(users));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("An error occurred: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("authentication.principal.id == #id")
    public ResponseEntity<ApiResponse<UserDTO>> updateUser(
            @PathVariable Long id,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String bio,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) MultipartFile profileImage,
            @RequestParam(required = false) MultipartFile coverImage) {
        UserDTO userDTO = new UserDTO(username, name, email, bio, location);  // Assuming UserDTO has a constructor to handle these parameters
        try {
            UserDTO updatedUser = userService.updateUser(id, userDTO, profileImage, coverImage);
            return ResponseEntity.ok(ApiResponse.success("User updated successfully", updatedUser));
        } catch (IOException e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to update user: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/follow")
    public ResponseEntity<ApiResponse<Void>> followUser(
            @PathVariable Long id,
            @CurrentUser Long currentUserId) {
        userService.followUser(currentUserId, id);
        return ResponseEntity.ok(ApiResponse.success("User followed successfully", null));
    }

    @PostMapping("/{id}/unfollow")
    public ResponseEntity<ApiResponse<Void>> unfollowUser(
            @PathVariable Long id,
            @CurrentUser Long currentUserId) {
        userService.unfollowUser(currentUserId, id);
        return ResponseEntity.ok(ApiResponse.success("User unfollowed successfully", null));
    }

    @GetMapping("/{id}/followers")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getFollowers(
            @PathVariable Long id,
            @CurrentUser Long currentUserId) {
        List<UserDTO> followers = userService.getFollowers(id);
        followers.forEach(user -> user.setFollowing(userService.isFollowing(currentUserId, user.getId())));
        return ResponseEntity.ok(ApiResponse.success(followers));
    }

    @GetMapping("/{id}/following")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getFollowing(
            @PathVariable Long id,
            @CurrentUser Long currentUserId) {
        List<UserDTO> following = userService.getFollowing(id);
        following.forEach(user -> user.setFollowing(userService.isFollowing(currentUserId, user.getId())));
        return ResponseEntity.ok(ApiResponse.success(following));
    }
}
