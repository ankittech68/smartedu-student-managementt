package com.smartedu.repository;

import com.smartedu.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUser_Id(Long userId);
    boolean existsByUser_Id(Long userId);
    Optional<Student> findByEmailIgnoreCase(String email);
    Optional<Student> findByUsernameIgnoreCase(String username);
}
