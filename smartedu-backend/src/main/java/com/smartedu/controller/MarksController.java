package com.smartedu.controller;

import com.smartedu.model.Marks;
import com.smartedu.service.MarksService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/marks")
public class MarksController {

    @Autowired
    private MarksService marksService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<Marks> addMarks(@RequestBody Marks marks) {
        return ResponseEntity.ok(marksService.addMarks(marks));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<List<Marks>> getAllMarks() {
        return ResponseEntity.ok(marksService.getAllMarks());
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER') or hasRole('STUDENT')")
    public ResponseEntity<List<Marks>> getMarksByStudent(@PathVariable Long studentId) {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        boolean isStudent = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_STUDENT"));
        if (isStudent) {
            return ResponseEntity.ok(marksService.getApprovedMarksByStudent(studentId));
        }
        return ResponseEntity.ok(marksService.getMarksByStudent(studentId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<Marks> updateMarks(@PathVariable Long id, @RequestBody Marks marksDetails) {
        return ResponseEntity.ok(marksService.updateMarks(id, marksDetails));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Marks> approveMarks(@PathVariable Long id) {
        return ResponseEntity.ok(marksService.updateApprovalStatus(id, com.smartedu.model.RecordStatus.APPROVED));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Marks> rejectMarks(@PathVariable Long id) {
        return ResponseEntity.ok(marksService.updateApprovalStatus(id, com.smartedu.model.RecordStatus.REJECTED));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<?> deleteMarks(@PathVariable Long id) {
        marksService.deleteMarks(id);
        return ResponseEntity.ok().build();
    }
}
