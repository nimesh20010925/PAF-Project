package com.skillshare.platform.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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

    public static MediaDTO fromMedia(Media media) {
        if (media == null) {
            return null;
        }
        
        // Ensure the URL is properly formatted
        String mediaUrl = media.getUrl();
        
        // If URL doesn't start with http or https, assume it's a relative path
        // and keep it as is - the frontend will handle prepending the base URL
        
        return MediaDTO.builder()
                .id(media.getId())
                .url(mediaUrl)
                .type(media.getType())
                .build();
    }
}
