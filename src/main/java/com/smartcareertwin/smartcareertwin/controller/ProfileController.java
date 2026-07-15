package com.smartcareertwin.smartcareertwin.controller;

import com.smartcareertwin.smartcareertwin.model.*;
import com.smartcareertwin.smartcareertwin.repository.UserRepository;
import com.smartcareertwin.smartcareertwin.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;
    private final UserRepository userRepository;

    private User getAuthenticatedUser(Principal principal) {
        if (principal == null) throw new RuntimeException("Unauthorized");
        Optional<User> userOpt = userRepository.findByGoogleId(principal.getName());
        return userOpt.orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getProfile(Principal principal) {
        User user = getAuthenticatedUser(principal);
        return ResponseEntity.ok(profileService.getFullProfile(user));
    }

    @PutMapping("/academic")
    public ResponseEntity<StudentProfile> updateAcademic(Principal principal, @RequestBody StudentProfile request) {
        User user = getAuthenticatedUser(principal);
        return ResponseEntity.ok(profileService.updateAcademicProfile(user, request.getCgpa(), request.getCgpaTrend()));
    }

    @PostMapping("/skills")
    public ResponseEntity<Skill> saveSkill(Principal principal, @RequestBody Skill skill) {
        User user = getAuthenticatedUser(principal);
        return ResponseEntity.ok(profileService.saveSkill(user, skill));
    }

    @DeleteMapping("/skills/{id}")
    public ResponseEntity<Void> deleteSkill(@PathVariable Long id) {
        profileService.deleteSkill(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/projects")
    public ResponseEntity<Project> saveProject(Principal principal, @RequestBody Project project) {
        User user = getAuthenticatedUser(principal);
        return ResponseEntity.ok(profileService.saveProject(user, project));
    }

    @DeleteMapping("/projects/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        profileService.deleteProject(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/coding-stats")
    public ResponseEntity<CodingStats> updateCodingStats(Principal principal, @RequestBody CodingStats stats) {
        User user = getAuthenticatedUser(principal);
        return ResponseEntity.ok(profileService.updateCodingStats(user, stats));
    }

    @PutMapping("/github-stats")
    public ResponseEntity<GithubStats> updateGithubStats(Principal principal, @RequestBody GithubStats stats) {
        User user = getAuthenticatedUser(principal);
        return ResponseEntity.ok(profileService.updateGithubStats(user, stats));
    }
}
