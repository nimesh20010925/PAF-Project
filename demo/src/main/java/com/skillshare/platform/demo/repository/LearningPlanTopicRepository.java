package com.skillshare.platform.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.skillshare.platform.demo.model.LearningPlanTopic;

@Repository
public interface LearningPlanTopicRepository extends JpaRepository<LearningPlanTopic, Long> {
    
    @Modifying
    @Query("DELETE FROM LearningPlanTopic t WHERE t.learningPlan.id = :learningPlanId")
    void deleteByLearningPlanId(Long learningPlanId);
}
