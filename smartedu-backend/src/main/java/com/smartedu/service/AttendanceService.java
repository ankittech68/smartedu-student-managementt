package com.smartedu.service;

import com.smartedu.model.Attendance;

import java.util.List;

public interface AttendanceService {
    Attendance markAttendance(Attendance attendance);
    List<Attendance> getAttendanceByStudent(Long studentId);
    List<Attendance> getApprovedAttendanceByStudent(Long studentId);
    List<Attendance> getAllAttendance();
    Attendance updateAttendance(Long id, Attendance attendance);
    Attendance updateApprovalStatus(Long id, com.smartedu.model.RecordStatus status);
    void deleteAttendance(Long id);
}
