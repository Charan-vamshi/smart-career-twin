package com.smartcareertwin.smartcareertwin.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "projects")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProjectCategory category;

    @Column(nullable = false)
    private String techStack; // comma-separated

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProjectComplexity complexity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeploymentStatus deploymentStatus;

    private Integer durationWeeks;

    @Enumerated(EnumType.STRING)
    private TeamSize teamSize;

    private String role; // nullable

    @Column(columnDefinition = "TEXT")
    private String outcome; // nullable
}
