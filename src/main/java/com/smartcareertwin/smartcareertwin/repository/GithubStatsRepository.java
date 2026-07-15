package com.smartcareertwin.smartcareertwin.repository;

import com.smartcareertwin.smartcareertwin.model.GithubStats;
import com.smartcareertwin.smartcareertwin.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GithubStatsRepository extends JpaRepository<GithubStats, Long> {
    Optional<GithubStats> findByUser(User user);
}
