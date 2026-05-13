package com.smartedu.repository;

import com.smartedu.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByStudentId(Long studentId);
    List<Attendance> findByStudentIdAndApprovalStatus(Long studentId, com.smartedu.model.RecordStatus approvalStatus);
    List<Attendance> findByApprovalStatus(com.smartedu.model.RecordStatus approvalStatus);
}
