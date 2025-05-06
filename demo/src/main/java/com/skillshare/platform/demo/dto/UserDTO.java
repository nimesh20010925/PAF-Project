package com.skillshare.platform.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    private LocalDateTime createdAt;
    private int followersCount;
    private int followingCount;
    private boolean isFollowing;
    private boolean hasActiveStories;

    public static UserDTO fromUser(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .name(user.getName())
                .bio(user.getBio())
                .location(user.getLocation())
                .avatarUrl(user.getAvatarUrl())
                .createdAt(user.getCreatedAt())
                .followersCount(user.getFollowers().size())
                .followingCount(user.getFollowing().size())
                .build();
    }

    public static UserDTO fromUser(User user, boolean isFollowing) {
        UserDTO dto = fromUser(user);
        dto.setFollowing(isFollowing);
        return dto;
    }
    
    public static UserDTO fromUser(User user, boolean isFollowing, boolean hasActiveStories) {
        UserDTO dto = fromUser(user, isFollowing);
        dto.setHasActiveStories(hasActiveStories);
        return dto;
    }
}
