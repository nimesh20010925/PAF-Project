package com.skillshare.platform.demo.dto.request;


import com.skillshare.platform.demo.model.PostType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostRequest {
    
    @NotBlank(message = "Content is required")
    private String content;
    
    @NotNull(message = "Post type is required")
    private PostType type;
}