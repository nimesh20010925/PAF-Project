package com.skillshare.platform.demo.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LearningPlanTopicRequest {
    
    @NotBlank(message = "Topic name is required")
    private String name;
    
    private String description;
    
    private String resources;
    
    private int orderIndex;
    
    private boolean completed;
}
