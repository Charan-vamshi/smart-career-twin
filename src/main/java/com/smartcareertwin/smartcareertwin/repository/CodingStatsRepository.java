package com.smartcareertwin.smartcareertwin.repository;

import com.smartcareertwin.smartcareertwin.model.CodingStats;
import com.smartcareertwin.smartcareertwin.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CodingStatsRepository extends JpaRepository<CodingStats, Long> {
    Optional<CodingStats> findByUser(User user);
}
