package com.smartcareertwin.smartcareertwin.controller;

import com.smartcareertwin.smartcareertwin.model.User;
import com.smartcareertwin.smartcareertwin.repository.UserRepository;
import com.smartcareertwin.smartcareertwin.service.RoadmapService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/roadmap")
@RequiredArgsConstructor
public class RoadmapController {

    private final RoadmapService roadmapService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<Map<String, String>> generateRoadmap(Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        User user = userRepository.findByGoogleId(principal.getName()).orElseThrow();
        String roadmapText = roadmapService.generateRoadmap(user);
        return ResponseEntity.ok(Map.of("roadmap", roadmapText));
    }
}
