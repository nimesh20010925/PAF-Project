package com.skillshare.platform.demo.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.skillshare.platform.demo.dto.LearningPlanDTO;
import com.skillshare.platform.demo.dto.request.LearningPlanRequest;
import com.skillshare.platform.demo.dto.response.ApiResponse;
import com.skillshare.platform.demo.security.CurrentUser;
import com.skillshare.platform.demo.service.LearningPlanService;

import java.util.List;

@RestController
@RequestMapping("/api/learning-plans")
@RequiredArgsConstructor
public class LearningPlanController {

    private final LearningPlanService learningPlanService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<LearningPlanDTO>>> getLearningPlansByUserId(@PathVariable Long userId) {
        try {
            System.out.println("GET /api/learning-plans/user/" + userId + " called");
            List<LearningPlanDTO> learningPlans = learningPlanService.getLearningPlansByUserId(userId);
            System.out.println("Returning " + learningPlans.size() + " learning plans for user " + userId);
            return ResponseEntity.ok(ApiResponse.success(learningPlans));
        } catch (Exception e) {
            System.err.println("Error in getLearningPlansByUserId: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LearningPlanDTO>> getLearningPlanById(@PathVariable Long id) {
        try {
            System.out.println("GET /api/learning-plans/" + id + " called");
            LearningPlanDTO learningPlan = learningPlanService.getLearningPlanById(id);
            System.out.println("Returning learning plan with id " + id);
            return ResponseEntity.ok(ApiResponse.success(learningPlan));
        } catch (Exception e) {
            System.err.println("Error in getLearningPlanById: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<LearningPlanDTO>>> searchLearningPlans(
            @RequestParam String query,
            @PageableDefault(size = 10) Pageable pageable) {
        try {
            System.out.println("GET /api/learning-plans/search called with query: " + query);
            Page<LearningPlanDTO> learningPlans = learningPlanService.searchLearningPlans(query, pageable);
            System.out.println("Returning " + learningPlans.getTotalElements() + " learning plans for search query: " + query);
            return ResponseEntity.ok(ApiResponse.success(learningPlans));
        } catch (Exception e) {
            System.err.println("Error in searchLearningPlans: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<LearningPlanDTO>> createLearningPlan(
            @Valid @RequestBody LearningPlanRequest request,
            @CurrentUser Long currentUserId) {
        try {
            System.out.println("POST /api/learning-plans called by user " + currentUserId);
            System.out.println("Request data: " + request);
            LearningPlanDTO createdLearningPlan = learningPlanService.createLearningPlan(request, currentUserId);
            System.out.println("Created learning plan with id " + createdLearningPlan.getId());
            return ResponseEntity.ok(ApiResponse.success("Learning plan created successfully", createdLearningPlan));
        } catch (Exception e) {
            System.err.println("Error in createLearningPlan: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("@learningPlanService.getLearningPlanById(#id).user.id == authentication.principal.id")
    public ResponseEntity<ApiResponse<LearningPlanDTO>> updateLearningPlan(
            @PathVariable Long id,
            @Valid @RequestBody LearningPlanRequest request,
            @CurrentUser Long currentUserId) {
        try {
            System.out.println("PUT /api/learning-plans/" + id + " called by user " + currentUserId);
            LearningPlanDTO updatedLearningPlan = learningPlanService.updateLearningPlan(id, request, currentUserId);
            System.out.println("Updated learning plan with id " + id);
            return ResponseEntity.ok(ApiResponse.success("Learning plan updated successfully", updatedLearningPlan));
        } catch (Exception e) {
            System.err.println("Error in updateLearningPlan: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@learningPlanService.getLearningPlanById(#id).user.id == authentication.principal.id")
    public ResponseEntity<ApiResponse<Void>> deleteLearningPlan(
            @PathVariable Long id,
            @CurrentUser Long currentUserId) {
        try {
            System.out.println("DELETE /api/learning-plans/" + id + " called by user " + currentUserId);
            learningPlanService.deleteLearningPlan(id, currentUserId);
            System.out.println("Deleted learning plan with id " + id);
            return ResponseEntity.ok(ApiResponse.success("Learning plan deleted successfully", null));
        } catch (Exception e) {
            System.err.println("Error in deleteLearningPlan: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<LearningPlanDTO>>> getAllLearningPlans(
            @PageableDefault(size = 10) Pageable pageable) {
        try {
            System.out.println("GET /api/learning-plans endpoint called with pageable: " + pageable);
            List<LearningPlanDTO> allPlans = learningPlanService.getAllLearningPlans();
            System.out.println("Retrieved " + allPlans.size() + " learning plans");
            return ResponseEntity.ok(ApiResponse.success(allPlans));
        } catch (Exception e) {
            System.err.println("Error in getAllLearningPlans: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}
