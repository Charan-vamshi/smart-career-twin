package com.smartcareertwin.smartcareertwin.repository;

import com.smartcareertwin.smartcareertwin.model.Project;
import com.smartcareertwin.smartcareertwin.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByUser(User user);
}
