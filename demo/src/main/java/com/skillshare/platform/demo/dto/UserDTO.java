package com.skillshare.platform.demo.dto;

import lombok.*;
import java.time.LocalDateTime;
import com.skillshare.platform.demo.model.User;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {

    private Long id;
    private String username;
    private String email;
    private String name;
    private String bio;
    private String location;
    private String avatarUrl;
    private String coverImage;
    private LocalDateTime createdAt;
    private int followersCount;
    private int followingCount;
    private boolean isFollowing;
    private boolean hasActiveStories;

    // Constructor for creating UserDTO with user data
    public static UserDTO fromUser(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .name(user.getName())
                .bio(user.getBio())
                .location(user.getLocation())
                .avatarUrl(user.getAvatarUrl())
                .coverImage(user.getCoverImage())
                .createdAt(user.getCreatedAt())
                .followersCount(user.getFollowers().size())  // Assuming user.getFollowers() is a collection
                .followingCount(user.getFollowing().size())  // Assuming user.getFollowing() is a collection
                .build();
    }

    // Constructor for creating UserDTO with user data and isFollowing flag
    public static UserDTO fromUser(User user, boolean isFollowing) {
        UserDTO dto = fromUser(user);  // Use the original fromUser method
        dto.setFollowing(isFollowing);  // Set the following status
        return dto;
    }

    // Constructor for creating UserDTO with user data, isFollowing flag, and hasActiveStories flag
    public static UserDTO fromUser(User user, boolean isFollowing, boolean hasActiveStories) {
        UserDTO dto = fromUser(user, isFollowing);  // Use the original fromUser method with isFollowing
        dto.setHasActiveStories(hasActiveStories);  // Set the active stories status
        return dto;
    }

    // Constructor to manually set properties (useful for update operations)
    public UserDTO(String username, String name, String email, String bio, String location) {
        this.username = username;
        this.name = name;
        this.email = email;
        this.bio = bio;
        this.location = location;
    }

    // Setter and Getter for isFollowing (Lombok @Data generates these, but you can override if needed)
    public void setFollowing(boolean isFollowing) {
        this.isFollowing = isFollowing;
    }

    public boolean isFollowing() {
        return isFollowing;
    }

    // Setter and Getter for hasActiveStories (Lombok @Data generates these, but you can override if needed)
    public void setHasActiveStories(boolean hasActiveStories) {
        this.hasActiveStories = hasActiveStories;
    }

    public boolean hasActiveStories() {
        return hasActiveStories;
    }
}
