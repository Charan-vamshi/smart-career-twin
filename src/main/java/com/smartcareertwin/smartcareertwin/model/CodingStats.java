package com.smartcareertwin.smartcareertwin.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "coding_stats")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CodingStats {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, columnDefinition = "integer default 0")
    @Builder.Default
    private Integer totalSolved = 0;

    @Column(nullable = false, columnDefinition = "integer default 0")
    @Builder.Default
    private Integer easy = 0;

    @Column(nullable = false, columnDefinition = "integer default 0")
    @Builder.Default
    private Integer medium = 0;

    @Column(nullable = false, columnDefinition = "integer default 0")
    @Builder.Default
    private Integer hard = 0;
}
