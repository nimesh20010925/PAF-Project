package com.skillshare.platform.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import com.skillshare.platform.demo.model.Post;
import com.skillshare.platform.demo.model.PostType;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostDTO {
    private Long id;
    private UserDTO user;
    private String content;
    private PostType type;
    private List<MediaDTO> media;
    private int likesCount;
    private int commentsCount;
    private boolean isLiked;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static PostDTO fromPost(Post post) {
        return PostDTO.builder()
                .id(post.getId())
                .user(UserDTO.fromUser(post.getUser()))
                .content(post.getContent())
                .type(post.getType())
                .media(post.getMedia().stream()
                        .map(MediaDTO::fromMedia)
                        .collect(Collectors.toList()))
                .likesCount(post.getLikes().size())
                .commentsCount(post.getComments().size())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }

    public static PostDTO fromPost(Post post, boolean isLiked) {
        PostDTO dto = fromPost(post);
        dto.setLiked(isLiked);
        return dto;
    }
}
