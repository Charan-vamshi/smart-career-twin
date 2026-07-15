package com.smartcareertwin.smartcareertwin.repository;

import com.smartcareertwin.smartcareertwin.model.StudentProfile;
import com.smartcareertwin.smartcareertwin.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {
    Optional<StudentProfile> findByUser(User user);
}
