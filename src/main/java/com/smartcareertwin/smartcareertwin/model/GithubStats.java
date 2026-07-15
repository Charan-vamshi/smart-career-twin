package com.smartcareertwin.smartcareertwin.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "github_stats")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GithubStats {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, columnDefinition = "integer default 0")
    @Builder.Default
    private Integer repoCount = 0;

    @Column(nullable = false, columnDefinition = "integer default 0")
    @Builder.Default
    private Integer activeMonths = 0;

    @Column(nullable = false, columnDefinition = "integer default 0")
    @Builder.Default
    private Integer stars = 0;
}
