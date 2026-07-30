package com.smartcareertwin.smartcareertwin.controller;

import com.smartcareertwin.smartcareertwin.dto.PlacementScoreResponse;
import com.smartcareertwin.smartcareertwin.model.User;
import com.smartcareertwin.smartcareertwin.repository.UserRepository;
import com.smartcareertwin.smartcareertwin.service.PredictionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

/**
 * REST Controller responsible for handling placement prediction requests.
 * Calculates and returns the user's predicted placement scores across different company tiers
 * based on their academic profile, skills, and coding statistics.
 */
@RestController
@RequestMapping("/api/predict")
@RequiredArgsConstructor
public class PredictionController {

    private final PredictionService predictionService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<PlacementScoreResponse> getPrediction(Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        User user = userRepository.findByGoogleId(principal.getName()).orElseThrow();
        return ResponseEntity.ok(predictionService.calculateScores(user));
    }
}
