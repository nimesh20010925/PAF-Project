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
        List<LearningPlanDTO> learningPlans = learningPlanService.getLearningPlansByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success(learningPlans));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LearningPlanDTO>> getLearningPlanById(@PathVariable Long id) {
        LearningPlanDTO learningPlan = learningPlanService.getLearningPlanById(id);
        return ResponseEntity.ok(ApiResponse.success(learningPlan));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<LearningPlanDTO>>> searchLearningPlans(
            @RequestParam String query,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<LearningPlanDTO> learningPlans = learningPlanService.searchLearningPlans(query, pageable);
        return ResponseEntity.ok(ApiResponse.success(learningPlans));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<LearningPlanDTO>> createLearningPlan(
            @Valid @RequestBody LearningPlanRequest request,
            @CurrentUser Long currentUserId) {
        LearningPlanDTO createdLearningPlan = learningPlanService.createLearningPlan(request, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Learning plan created successfully", createdLearningPlan));
    }

    @PutMapping("/{id}")
    @PreAuthorize("@learningPlanService.getLearningPlanById(#id).user.id == authentication.principal.id")
    public ResponseEntity<ApiResponse<LearningPlanDTO>> updateLearningPlan(
            @PathVariable Long id,
            @Valid @RequestBody LearningPlanRequest request,
            @CurrentUser Long currentUserId) {
        LearningPlanDTO updatedLearningPlan = learningPlanService.updateLearningPlan(id, request, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Learning plan updated successfully", updatedLearningPlan));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@learningPlanService.getLearningPlanById(#id).user.id == authentication.principal.id")
    public ResponseEntity<ApiResponse<Void>> deleteLearningPlan(
            @PathVariable Long id,
            @CurrentUser Long currentUserId) {
        learningPlanService.deleteLearningPlan(id, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Learning plan deleted successfully", null));
    }

}
