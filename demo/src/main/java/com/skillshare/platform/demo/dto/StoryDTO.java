package com.skillshare.platform.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

import com.skillshare.platform.demo.model.MediaType;
import com.skillshare.platform.demo.model.Story;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StoryDTO {
    private Long id;
    private UserDTO user;
    private String content;
    private String mediaUrl;
    private MediaType mediaType;
    private int viewsCount;
    private boolean viewed;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;

    public static StoryDTO fromStory(Story story) {
        if (story == null) {
            return null;
        }
        
        return StoryDTO.builder()
                .id(story.getId())
                .user(UserDTO.fromUser(story.getUser()))
                .content(story.getContent())
                .mediaUrl(story.getMediaUrl())
                .mediaType(story.getMediaType())
                .viewsCount(story.getViewers() != null ? story.getViewers().size() : 0)
                .createdAt(story.getCreatedAt())
                .expiresAt(story.getExpiresAt())
                .build();
    }

    public static StoryDTO fromStory(Story story, boolean viewed) {
        if (story == null) {
            return null;
        }
        
        StoryDTO dto = fromStory(story);
        if (dto != null) {
            dto.setViewed(viewed);
        }
        return dto;
    }
}
