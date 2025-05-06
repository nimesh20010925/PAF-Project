package com.skillshare.platform.demo.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.skillshare.platform.demo.dto.UserDTO;
import com.skillshare.platform.demo.dto.response.ApiResponse;
import com.skillshare.platform.demo.security.CurrentUser;
import com.skillshare.platform.demo.service.UserService;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{username}")
    public ResponseEntity<ApiResponse<UserDTO>> getUserByUsername(@PathVariable String username, @CurrentUser Long currentUserId) {
        UserDTO userDTO = userService.getUserByUsername(username);
        boolean isFollowing = userService.isFollowing(currentUserId, userDTO.getId());
        userDTO.setFollowing(isFollowing);
        return ResponseEntity.ok(ApiResponse.success(userDTO));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<UserDTO>>> searchUsers(@RequestParam String query, @CurrentUser Long currentUserId) {
        List<UserDTO> users = userService.searchUsers(query);
        // Set isFollowing for each user
        users.forEach(user -> user.setFollowing(userService.isFollowing(currentUserId, user.getId())));
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/suggested")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getSuggestedUsers(
            @RequestParam(defaultValue = "5") int limit,
            @CurrentUser Long currentUserId) {
        List<UserDTO> users = userService.getSuggestedUsers(limit);
        // Set isFollowing for each user
        users.forEach(user -> user.setFollowing(userService.isFollowing(currentUserId, user.getId())));
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @PutMapping("/{id}")
    @PreAuthorize("authentication.principal.id == #id")
    public ResponseEntity<ApiResponse<UserDTO>> updateUser(@PathVariable Long id, @RequestBody UserDTO userDTO) {
        UserDTO updatedUser = userService.updateUser(id, userDTO);
        return ResponseEntity.ok(ApiResponse.success("User updated successfully", updatedUser));
    }

    @PostMapping("/{id}/follow")
    public ResponseEntity<ApiResponse<Void>> followUser(@PathVariable Long id, @CurrentUser Long currentUserId) {
        userService.followUser(currentUserId, id);
        return ResponseEntity.ok(ApiResponse.success("User followed successfully", null));
    }

    @PostMapping("/{id}/unfollow")
    public ResponseEntity<ApiResponse<Void>> unfollowUser(@PathVariable Long id, @CurrentUser Long currentUserId) {
        userService.unfollowUser(currentUserId, id);
        return ResponseEntity.ok(ApiResponse.success("User unfollowed successfully", null));
    }

    @GetMapping("/{id}/followers")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getFollowers(
            @PathVariable Long id,
            @CurrentUser Long currentUserId) {
        List<UserDTO> followers = userService.getFollowers(id);
        // Set isFollowing for each follower
        followers.forEach(user -> user.setFollowing(userService.isFollowing(currentUserId, user.getId())));
        return ResponseEntity.ok(ApiResponse.success(followers));
    }

    @GetMapping("/{id}/following")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getFollowing(
            @PathVariable Long id,
            @CurrentUser Long currentUserId) {
        List<UserDTO> following = userService.getFollowing(id);
        // Set isFollowing for each followed user
        following.forEach(user -> user.setFollowing(userService.isFollowing(currentUserId, user.getId())));
        return ResponseEntity.ok(ApiResponse.success(following));
    }

}
