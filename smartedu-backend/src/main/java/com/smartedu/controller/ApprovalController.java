package com.smartedu.controller;

import com.smartedu.model.Attendance;
import com.smartedu.model.Marks;
import com.smartedu.model.RecordStatus;
import com.smartedu.repository.AttendanceRepository;
import com.smartedu.repository.MarksRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/approvals")
public class ApprovalController {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private MarksRepository marksRepository;

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getPendingApprovals() {
        List<Attendance> pendingAttendance = attendanceRepository.findByApprovalStatus(RecordStatus.PENDING);
        List<Marks> pendingMarks = marksRepository.findByApprovalStatus(RecordStatus.PENDING);

        Map<String, Object> response = new HashMap<>();
        response.put("attendance", pendingAttendance);
        response.put("marks", pendingMarks);

        return ResponseEntity.ok(response);
    }
}
