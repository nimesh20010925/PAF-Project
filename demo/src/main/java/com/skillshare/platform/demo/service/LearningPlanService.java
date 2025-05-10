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
import com.skillshare.platform.demo.repository.LearningPlanTopicRepository;
import com.skillshare.platform.demo.repository.UserRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LearningPlanService {

    private final LearningPlanRepository learningPlanRepository;
    private final LearningPlanTopicRepository learningPlanTopicRepository;
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
            
            // Save topics individually
            topics.forEach(learningPlanTopicRepository::save);
            
            // Update progress
            updateProgress(savedLearningPlan);
        }

        return LearningPlanDTO.fromLearningPlan(savedLearningPlan);
    }

    @Transactional
    public LearningPlanDTO updateLearningPlan(Long id, LearningPlanRequest request, Long userId) {
        try {
            System.out.println("Updating learning plan with ID: " + id);
            System.out.println("Request data: " + request.toString());
            
            // 1. Get the learning plan
            LearningPlan learningPlan = learningPlanRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Learning plan not found with id: " + id));

            // 2. Check ownership
            if (!learningPlan.getUser().getId().equals(userId)) {
                throw new IllegalArgumentException("You are not authorized to update this learning plan");
            }

            // 3. Update basic fields
            learningPlan.setTitle(request.getTitle());
            learningPlan.setDescription(request.getDescription());
            learningPlan.setStartDate(request.getStartDate());
            learningPlan.setEndDate(request.getEndDate());
            
            // 4. Save the learning plan with basic updates
            learningPlan = learningPlanRepository.save(learningPlan);
            
            // 5. Delete all existing topics using the repository method
            System.out.println("Deleting existing topics for learning plan: " + id);
            learningPlanTopicRepository.deleteByLearningPlanId(id);
            
            // 6. Create and save new topics
            if (request.getTopics() != null && !request.getTopics().isEmpty()) {
                System.out.println("Creating " + request.getTopics().size() + " new topics");
                
                List<LearningPlanTopic> newTopics = new ArrayList<>();
                for (int i = 0; i < request.getTopics().size(); i++) {
                    LearningPlanTopicRequest topicRequest = request.getTopics().get(i);
                    
                    // Create a new topic
                    LearningPlanTopic topic = LearningPlanTopic.builder()
                            .learningPlan(learningPlan)
                            .name(topicRequest.getTitle() != null ? topicRequest.getTitle() : topicRequest.getName())
                            .description(topicRequest.getDescription())
                            .resources(topicRequest.getResources())
                            .orderIndex(i)
                            .completed(topicRequest.isCompleted())
                            .build();
                    
                    // Save the topic
                    LearningPlanTopic savedTopic = learningPlanTopicRepository.save(topic);
                    newTopics.add(savedTopic);
                }
                
                // 7. Update progress
                int completedTopics = (int) newTopics.stream().filter(LearningPlanTopic::isCompleted).count();
                int totalTopics = newTopics.size();
                int progress = totalTopics > 0 ? (completedTopics * 100) / totalTopics : 0;
                learningPlan.setProgress(progress);
                
                // 8. Save the learning plan with updated progress
                learningPlan = learningPlanRepository.save(learningPlan);
            }
            
            // 9. Return the updated learning plan
            return LearningPlanDTO.fromLearningPlan(learningPlan);
        } catch (Exception e) {
            System.err.println("Error updating learning plan: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Transactional
    public void deleteLearningPlan(Long id, Long userId) {
        LearningPlan learningPlan = learningPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Learning plan not found with id: " + id));

        if (!learningPlan.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You are not authorized to delete this learning plan");
        }

        // Delete all topics first
        learningPlanTopicRepository.deleteByLearningPlanId(id);
        
        // Then delete the learning plan
        learningPlanRepository.delete(learningPlan);
    }

    private LearningPlanTopic createTopic(LearningPlan learningPlan, LearningPlanTopicRequest request) {
        return LearningPlanTopic.builder()
                .learningPlan(learningPlan)
                .name(request.getTitle() != null ? request.getTitle() : request.getName()) // Handle both fields
                .description(request.getDescription())
                .resources(request.getResources())
                .orderIndex(request.getOrderIndex())
                .completed(request.isCompleted())
                .build();
    }
    
    private void updateProgress(LearningPlan learningPlan) {
        int completedTopics = (int) learningPlan.getTopics().stream().filter(LearningPlanTopic::isCompleted).count();
        int totalTopics = learningPlan.getTopics().size();
        int progress = totalTopics > 0 ? (completedTopics * 100) / totalTopics : 0;
        learningPlan.setProgress(progress);
        learningPlanRepository.save(learningPlan);
    }

    public List<LearningPlanDTO> getAllLearningPlans() {
        System.out.println("LearningPlanService.getAllLearningPlans called");
        try {
            List<LearningPlan> plans = learningPlanRepository.findAll();
            System.out.println("Found " + plans.size() + " learning plans in repository");
        
            List<LearningPlanDTO> dtos = plans.stream()
                    .map(LearningPlanDTO::fromLearningPlan)
                    .collect(Collectors.toList());
            System.out.println("Converted " + dtos.size() + " plans to DTOs");
            return dtos;
        } catch (Exception e) {
            System.err.println("Error in LearningPlanService.getAllLearningPlans: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}
