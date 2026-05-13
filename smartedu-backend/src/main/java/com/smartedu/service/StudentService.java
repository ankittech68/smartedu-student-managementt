package com.smartedu.service;

import com.smartedu.model.Student;

import java.util.List;

public interface StudentService {
    Student saveStudent(Student student);
    List<Student> getAllStudents();
    Student getStudentById(Long id);
    Student getStudentByUserId(Long userId);
    Student updateStudent(Long id, Student student);
    void deleteStudent(Long id);
}
