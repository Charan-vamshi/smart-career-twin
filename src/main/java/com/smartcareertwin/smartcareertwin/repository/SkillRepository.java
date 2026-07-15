package com.smartcareertwin.smartcareertwin.repository;

import com.smartcareertwin.smartcareertwin.model.Skill;
import com.smartcareertwin.smartcareertwin.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SkillRepository extends JpaRepository<Skill, Long> {
    List<Skill> findByUser(User user);
}
