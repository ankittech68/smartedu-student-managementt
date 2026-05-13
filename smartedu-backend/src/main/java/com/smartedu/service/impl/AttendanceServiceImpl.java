package com.smartedu.service.impl;

import com.smartedu.model.Attendance;
import com.smartedu.repository.AttendanceRepository;
import com.smartedu.service.AttendanceService;
import com.smartedu.model.Role;
import com.smartedu.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AttendanceServiceImpl implements AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private NotificationService notificationService;

    @Override
    public Attendance markAttendance(Attendance attendance) {
        attendance.setApprovalStatus(com.smartedu.model.RecordStatus.PENDING);
        Attendance saved = attendanceRepository.save(attendance);
        notificationService.createNotificationForRole(Role.ADMIN, "Pending Attendance", "New attendance record pending approval.");
        return saved;
    }

    @Override
    public List<Attendance> getAttendanceByStudent(Long studentId) {
        return attendanceRepository.findByStudentId(studentId);
    }

    @Override
    public List<Attendance> getApprovedAttendanceByStudent(Long studentId) {
        return attendanceRepository.findByStudentIdAndApprovalStatus(studentId, com.smartedu.model.RecordStatus.APPROVED);
    }

    @Override
    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findAll();
    }

    @Override
    public Attendance updateAttendance(Long id, Attendance attendanceDetails) {
        Attendance existing = attendanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attendance not found with id: " + id));

        existing.setStatus(attendanceDetails.getStatus());
        existing.setDate(attendanceDetails.getDate());
        existing.setApprovalStatus(com.smartedu.model.RecordStatus.PENDING);

        Attendance saved = attendanceRepository.save(existing);
        notificationService.createNotificationForRole(Role.ADMIN, "Pending Attendance", "Attendance record updated and pending approval.");
        return saved;
    }

    @Override
    public Attendance updateApprovalStatus(Long id, com.smartedu.model.RecordStatus status) {
        Attendance existing = attendanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attendance not found with id: " + id));
        existing.setApprovalStatus(status);
        Attendance saved = attendanceRepository.save(existing);
        
        if (saved.getStudent() != null && saved.getStudent().getUser() != null) {
            notificationService.createNotification(saved.getStudent().getUser(), "Attendance " + status, "Your attendance for " + saved.getDate() + " was " + status);
        }
        return saved;
    }

    @Override
    public void deleteAttendance(Long id) {
        attendanceRepository.deleteById(id);
    }
}
