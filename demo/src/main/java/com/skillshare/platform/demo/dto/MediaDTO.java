package com.skillshare.platform.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

import com.skillshare.platform.demo.model.Media;
import com.skillshare.platform.demo.model.MediaType;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MediaDTO {
    private Long id;
    private String url;
    private MediaType type;
    private LocalDateTime createdAt;

    public static MediaDTO fromMedia(Media media) {
        return MediaDTO.builder()
                .id(media.getId())
                .url(media.getUrl())
                .type(media.getType())
                .createdAt(media.getCreatedAt())
                .build();
    }
}
