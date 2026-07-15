package com.smartcareertwin.smartcareertwin.service;

import com.smartcareertwin.smartcareertwin.model.*;
import com.smartcareertwin.smartcareertwin.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final StudentProfileRepository profileRepository;
    private final SkillRepository skillRepository;
    private final ProjectRepository projectRepository;
    private final CodingStatsRepository codingStatsRepository;
    private final GithubStatsRepository githubStatsRepository;

    public Map<String, Object> getFullProfile(User user) {
        Map<String, Object> response = new HashMap<>();
        response.put("academic", profileRepository.findByUser(user).orElse(null));
        response.put("skills", skillRepository.findByUser(user));
        response.put("projects", projectRepository.findByUser(user));
        response.put("codingStats", codingStatsRepository.findByUser(user).orElse(null));
        response.put("githubStats", githubStatsRepository.findByUser(user).orElse(null));
        return response;
    }

    public StudentProfile updateAcademicProfile(User user, Double cgpa, CgpaTrend trend) {
        StudentProfile profile = profileRepository.findByUser(user)
                .orElse(StudentProfile.builder().user(user).build());
        profile.setCgpa(cgpa);
        profile.setCgpaTrend(trend);
        return profileRepository.save(profile);
    }

    public Skill saveSkill(User user, Skill skill) {
        skill.setUser(user);
        return skillRepository.save(skill);
    }

    public void deleteSkill(Long id) {
        skillRepository.deleteById(id);
    }

    public Project saveProject(User user, Project project) {
        project.setUser(user);
        return projectRepository.save(project);
    }

    public void deleteProject(Long id) {
        projectRepository.deleteById(id);
    }

    public CodingStats updateCodingStats(User user, CodingStats stats) {
        CodingStats existing = codingStatsRepository.findByUser(user)
                .orElse(CodingStats.builder().user(user).build());
        existing.setTotalSolved(stats.getTotalSolved());
        existing.setEasy(stats.getEasy());
        existing.setMedium(stats.getMedium());
        existing.setHard(stats.getHard());
        return codingStatsRepository.save(existing);
    }

    public GithubStats updateGithubStats(User user, GithubStats stats) {
        GithubStats existing = githubStatsRepository.findByUser(user)
                .orElse(GithubStats.builder().user(user).build());
        existing.setRepoCount(stats.getRepoCount());
        existing.setActiveMonths(stats.getActiveMonths());
        existing.setStars(stats.getStars());
        return githubStatsRepository.save(existing);
    }
}
