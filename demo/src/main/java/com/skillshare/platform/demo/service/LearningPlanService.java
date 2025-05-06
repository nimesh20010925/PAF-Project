package com.skillshare.platform.demo.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.skillshare.platform.demo.dto.LearningPlanDTO;
import com.skillshare.platform.demo.dto.request.LearningPlanRequest;
import com.skillshare.platform.demo.dto.request.LearningPlanTopicRequest;
import com.skillshare.platform.demo.exception.ResourceNotFoundException;
import com.skillshare.platform.demo.model.LearningPlan;
import com.skillshare.platform.demo.model.LearningPlanTopic;
import com.skillshare.platform.demo.model.User;
import com.skillshare.platform.demo.repository.LearningPlanRepository;
import com.skillshare.platform.demo.repository.UserRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LearningPlanService {

    private final LearningPlanRepository learningPlanRepository;
    private final UserRepository userRepository;

    public List<LearningPlanDTO> getLearningPlansByUserId(Long userId) {
        List<LearningPlan> learningPlans = learningPlanRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return learningPlans.stream()
                .map(LearningPlanDTO::fromLearningPlan)
                .collect(Collectors.toList());
    }

    public LearningPlanDTO getLearningPlanById(Long id) {
        LearningPlan learningPlan = learningPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Learning plan not found with id: " + id));
        return LearningPlanDTO.fromLearningPlan(learningPlan);
    }

    public Page<LearningPlanDTO> searchLearningPlans(String query, Pageable pageable) {
        Page<LearningPlan> learningPlans = learningPlanRepository.findByTitleContainingOrderByCreatedAtDesc(query, pageable);
        return learningPlans.map(LearningPlanDTO::fromLearningPlan);
    }

    @Transactional
    public LearningPlanDTO createLearningPlan(LearningPlanRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        LearningPlan learningPlan = LearningPlan.builder()
                .user(user)
                .title(request.getTitle())
                .description(request.getDescription())
                .progress(0)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .topics(new ArrayList<>())
                .build();

        LearningPlan savedLearningPlan = learningPlanRepository.save(learningPlan);

        if (request.getTopics() != null && !request.getTopics().isEmpty()) {
            List<LearningPlanTopic> topics = request.getTopics().stream()
                    .map(topicRequest -> createTopic(savedLearningPlan, topicRequest))
                    .collect(Collectors.toList());
            savedLearningPlan.setTopics(topics);
        }

        return LearningPlanDTO.fromLearningPlan(savedLearningPlan);
    }

    @Transactional
    public LearningPlanDTO updateLearningPlan(Long id, LearningPlanRequest request, Long userId) {
        LearningPlan learningPlan = learningPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Learning plan not found with id: " + id));

        if (!learningPlan.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You are not authorized to update this learning plan");
        }

        learningPlan.setTitle(request.getTitle());
        learningPlan.setDescription(request.getDescription());
        learningPlan.setStartDate(request.getStartDate());
        learningPlan.setEndDate(request.getEndDate());

        // Update progress based on completed topics
        if (request.getTopics() != null && !request.getTopics().isEmpty()) {
            // Clear existing topics and add new ones
            learningPlan.getTopics().clear();
            List<LearningPlanTopic> topics = request.getTopics().stream()
                    .map(topicRequest -> createTopic(learningPlan, topicRequest))
                    .collect(Collectors.toList());
            learningPlan.setTopics(topics);

            // Calculate progress
            int completedTopics = (int) topics.stream().filter(LearningPlanTopic::isCompleted).count();
            int totalTopics = topics.size();
            int progress = totalTopics > 0 ? (completedTopics * 100) / totalTopics : 0;
            learningPlan.setProgress(progress);
        }

        LearningPlan updatedLearningPlan = learningPlanRepository.save(learningPlan);
        return LearningPlanDTO.fromLearningPlan(updatedLearningPlan);
    }

    @Transactional
    public void deleteLearningPlan(Long id, Long userId) {
        LearningPlan learningPlan = learningPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Learning plan not found with id: " + id));

        if (!learningPlan.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You are not authorized to delete this learning plan");
        }

        learningPlanRepository.delete(learningPlan);
    }

    private LearningPlanTopic createTopic(LearningPlan learningPlan, LearningPlanTopicRequest request) {
        return LearningPlanTopic.builder()
                .learningPlan(learningPlan)
                .name(request.getName())
                .description(request.getDescription())
                .resources(request.getResources())
                .orderIndex(request.getOrderIndex())
                .completed(request.isCompleted())
                .build();
    }
}
