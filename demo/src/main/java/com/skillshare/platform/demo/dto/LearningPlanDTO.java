package com.skillshare.platform.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import com.skillshare.platform.demo.model.LearningPlan;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LearningPlanDTO {
    private Long id;
    private UserDTO user;
    private String title;
    private String description;
    private int progress;
    private List<LearningPlanTopicDTO> topics;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static LearningPlanDTO fromLearningPlan(LearningPlan learningPlan) {
        return LearningPlanDTO.builder()
                .id(learningPlan.getId())
                .user(UserDTO.fromUser(learningPlan.getUser()))
                .title(learningPlan.getTitle())
                .description(learningPlan.getDescription())
                .progress(learningPlan.getProgress())
                .topics(learningPlan.getTopics().stream()
                        .map(LearningPlanTopicDTO::fromLearningPlanTopic)
                        .collect(Collectors.toList()))
                .startDate(learningPlan.getStartDate())
                .endDate(learningPlan.getEndDate())
                .createdAt(learningPlan.getCreatedAt())
                .updatedAt(learningPlan.getUpdatedAt())
                .build();
    }
}
