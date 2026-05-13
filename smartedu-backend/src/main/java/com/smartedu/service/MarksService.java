package com.smartedu.service;

import com.smartedu.model.Marks;

import java.util.List;

public interface MarksService {
    Marks addMarks(Marks marks);
    List<Marks> getMarksByStudent(Long studentId);
    List<Marks> getApprovedMarksByStudent(Long studentId);
    List<Marks> getAllMarks();
    Marks updateMarks(Long id, Marks marks);
    Marks updateApprovalStatus(Long id, com.smartedu.model.RecordStatus status);
    void deleteMarks(Long id);
}
