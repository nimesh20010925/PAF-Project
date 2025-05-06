package com.skillshare.platform.demo.dto;

import com.skillshare.platform.demo.model.LearningPlanTopic;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LearningPlanTopicDTO {
    private Long id;
    private String name;
    private String description;
    private String resources;
    private int orderIndex;
    private boolean completed;

    public static LearningPlanTopicDTO fromLearningPlanTopic(LearningPlanTopic topic) {
        return LearningPlanTopicDTO.builder()
                .id(topic.getId())
                .name(topic.getName())
                .description(topic.getDescription())
                .resources(topic.getResources())
                .orderIndex(topic.getOrderIndex())
                .completed(topic.isCompleted())
                .build();
    }
}
