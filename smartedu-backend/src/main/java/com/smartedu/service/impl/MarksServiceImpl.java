package com.smartedu.service.impl;

import com.smartedu.model.Marks;
import com.smartedu.repository.MarksRepository;
import com.smartedu.service.MarksService;
import com.smartedu.model.Role;
import com.smartedu.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MarksServiceImpl implements MarksService {

    @Autowired
    private MarksRepository marksRepository;

    @Autowired
    private NotificationService notificationService;

    @Override
    public Marks addMarks(Marks marks) {
        calculateGrade(marks);
        marks.setApprovalStatus(com.smartedu.model.RecordStatus.PENDING);
        Marks saved = marksRepository.save(marks);
        notificationService.createNotificationForRole(Role.ADMIN, "Pending Marks", "New marks record pending approval.");
        return saved;
    }

    @Override
    public List<Marks> getMarksByStudent(Long studentId) {
        return marksRepository.findByStudentId(studentId);
    }

    @Override
    public List<Marks> getApprovedMarksByStudent(Long studentId) {
        return marksRepository.findByStudentIdAndApprovalStatus(studentId, com.smartedu.model.RecordStatus.APPROVED);
    }

    @Override
    public List<Marks> getAllMarks() {
        return marksRepository.findAll();
    }

    @Override
    public Marks updateMarks(Long id, Marks marksDetails) {
        Marks existing = marksRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Marks record not found with id: " + id));

        existing.setSubject(marksDetails.getSubject());
        existing.setMarksObtained(marksDetails.getMarksObtained());
        existing.setTotalMarks(marksDetails.getTotalMarks());
        calculateGrade(existing);
        existing.setApprovalStatus(com.smartedu.model.RecordStatus.PENDING);

        Marks saved = marksRepository.save(existing);
        notificationService.createNotificationForRole(Role.ADMIN, "Pending Marks", "Marks record updated and pending approval.");
        return saved;
    }

    @Override
    public Marks updateApprovalStatus(Long id, com.smartedu.model.RecordStatus status) {
        Marks existing = marksRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Marks record not found with id: " + id));
        existing.setApprovalStatus(status);
        Marks saved = marksRepository.save(existing);
        
        if (saved.getStudent() != null && saved.getStudent().getUser() != null) {
            notificationService.createNotification(saved.getStudent().getUser(), "Marks " + status, "Your marks for " + saved.getSubject() + " were " + status);
        }
        return saved;
    }

    @Override
    public void deleteMarks(Long id) {
        marksRepository.deleteById(id);
    }

    private void calculateGrade(Marks marks) {
        double percentage = (marks.getMarksObtained() / marks.getTotalMarks()) * 100;
        if (percentage >= 90) marks.setGrade("O");
        else if (percentage >= 80) marks.setGrade("A+");
        else if (percentage >= 70) marks.setGrade("A");
        else if (percentage >= 60) marks.setGrade("B+");
        else if (percentage >= 50) marks.setGrade("B");
        else if (percentage >= 40) marks.setGrade("C");
        else if (percentage >= 33) marks.setGrade("D");
        else marks.setGrade("F");
    }
}
