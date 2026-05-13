package com.smartedu.repository;

import com.smartedu.model.Marks;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MarksRepository extends JpaRepository<Marks, Long> {
    List<Marks> findByStudentId(Long studentId);
    List<Marks> findByStudentIdAndApprovalStatus(Long studentId, com.smartedu.model.RecordStatus approvalStatus);
    List<Marks> findByApprovalStatus(com.smartedu.model.RecordStatus approvalStatus);
}
