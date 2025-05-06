package com.skillshare.platform.demo.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.skillshare.platform.demo.model.LearningPlan;

import java.util.List;

@Repository
public interface LearningPlanRepository extends JpaRepository<LearningPlan, Long> {
    
    List<LearningPlan> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    Page<LearningPlan> findByTitleContainingOrderByCreatedAtDesc(String query, Pageable pageable);
}
