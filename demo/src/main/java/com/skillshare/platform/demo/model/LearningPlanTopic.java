package com.skillshare.platform.demo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "learning_plan_topics")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LearningPlanTopic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "learning_plan_id", nullable = false)
    private LearningPlan learningPlan;

    @Column(nullable = false)
    private String name;

    private String description;

    private String resources;

    private int orderIndex;

    private boolean completed;
}

