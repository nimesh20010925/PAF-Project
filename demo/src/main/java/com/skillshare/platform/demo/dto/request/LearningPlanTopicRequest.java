package com.skillshare.platform.demo.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LearningPlanTopicRequest {
    
    private Long id;
    
    private String title;
    
    private String description;
    
    private String resources;
    
    private int orderIndex;
    
    private boolean completed;
    
    // For backward compatibility with older frontend code
    private String name;
    
    // Getter that handles both title and name fields
    public String getTitle() {
        // If title is null but name is provided, use name
        if (title == null && name != null) {
            return name;
        }
        return title;
    }
}
