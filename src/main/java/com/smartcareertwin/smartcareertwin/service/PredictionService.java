package com.smartcareertwin.smartcareertwin.service;

import com.smartcareertwin.smartcareertwin.dto.PlacementScoreResponse;
import com.smartcareertwin.smartcareertwin.model.*;
import com.smartcareertwin.smartcareertwin.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PredictionService {

    private final StudentProfileRepository profileRepository;
    private final SkillRepository skillRepository;
    private final ProjectRepository projectRepository;
    private final CodingStatsRepository codingStatsRepository;
    private final GithubStatsRepository githubStatsRepository;

    public PlacementScoreResponse calculateScores(User user) {
        StudentProfile profile = profileRepository.findByUser(user).orElse(new StudentProfile());
        List<Skill> skills = skillRepository.findByUser(user);
        List<Project> projects = projectRepository.findByUser(user);
        CodingStats codingStats = codingStatsRepository.findByUser(user).orElse(new CodingStats());
        GithubStats githubStats = githubStatsRepository.findByUser(user).orElse(new GithubStats());

        double cgpaNorm = calculateCgpaNorm(profile);
        double skillsNorm = calculateSkillsNorm(skills);
        double projectsNorm = calculateProjectsNorm(projects);
        double codingNorm = calculateCodingNorm(codingStats);
        double githubNorm = calculateGithubNorm(githubStats);

        double tier1 = (cgpaNorm * 0.10) + (skillsNorm * 0.20) + (projectsNorm * 0.30) + (codingNorm * 0.35) + (githubNorm * 0.05);
        double tier2 = (cgpaNorm * 0.35) + (skillsNorm * 0.25) + (projectsNorm * 0.15) + (codingNorm * 0.20) + (githubNorm * 0.05);
        double tier3 = (cgpaNorm * 0.05) + (skillsNorm * 0.30) + (projectsNorm * 0.35) + (codingNorm * 0.15) + (githubNorm * 0.15);

        return PlacementScoreResponse.builder()
                .tier1Score(Math.round(tier1 * 100.0) / 100.0)
                .tier2Score(Math.round(tier2 * 100.0) / 100.0)
                .tier3Score(Math.round(tier3 * 100.0) / 100.0)
                .build();
    }

    private double calculateCgpaNorm(StudentProfile profile) {
        if (profile.getCgpa() == null) return 0;
        return (profile.getCgpa() / 10.0) * 100.0;
    }

    private double calculateSkillsNorm(List<Skill> skills) {
        if (skills == null || skills.isEmpty()) return 0;
        double sum = 0;
        for (Skill skill : skills) {
            sum += switch (skill.getProficiency()) {
                case BEGINNER -> 25;
                case INTERMEDIATE -> 50;
                case ADVANCED -> 75;
                case PRODUCTION_USED -> 100;
            };
        }
        return sum / skills.size();
    }

    private double calculateProjectsNorm(List<Project> projects) {
        if (projects == null || projects.isEmpty()) return 0;
        double sum = 0;
        for (Project project : projects) {
            double score = 0;
            score += switch (project.getComplexity()) {
                case CRUD_BASIC -> 25;
                case INTEGRATED_MULTI_SERVICE -> 50;
                case DEPLOYED_SCALED -> 75;
                case RESEARCH_GRADE -> 100;
            };
            score += switch (project.getDeploymentStatus()) {
                case LOCAL -> 0;
                case HOSTED -> 10;
                case PRODUCTION_USERS -> 20;
            };
            if (project.getOutcome() != null && !project.getOutcome().isBlank()) {
                score += 10;
            }
            sum += Math.min(score, 100);
        }
        return sum / projects.size();
    }

    private double calculateCodingNorm(CodingStats stats) {
        if (stats.getTotalSolved() == null || stats.getTotalSolved() == 0) return 0;
        
        // Weight: easy=1, medium=2, hard=4
        double effectivePoints = (stats.getEasy() != null ? stats.getEasy() : 0) * 1.0 +
                                 (stats.getMedium() != null ? stats.getMedium() : 0) * 2.0 +
                                 (stats.getHard() != null ? stats.getHard() : 0) * 4.0;
        
        // 150 hard = 600 points = 100%
        // 300 medium = 600 points = 100%
        double score = (effectivePoints / 600.0) * 100.0;
        return Math.min(score, 100.0);
    }

    private double calculateGithubNorm(GithubStats stats) {
        int repoCount = Math.min(stats.getRepoCount() != null ? stats.getRepoCount() : 0, 20); // max 40 points
        int activeMonths = Math.min(stats.getActiveMonths() != null ? stats.getActiveMonths() : 0, 12); // max 36 points
        int stars = Math.min(stats.getStars() != null ? stats.getStars() : 0, 50); // max 24 points (50 * 0.48)
        
        double score = (repoCount * 2.0) + (activeMonths * 3.0) + (stars * 0.48);
        return Math.min(score, 100.0);
    }
}
