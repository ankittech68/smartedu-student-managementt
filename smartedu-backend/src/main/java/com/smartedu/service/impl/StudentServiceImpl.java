package com.smartedu.service.impl;

import com.smartedu.model.Student;
import com.smartedu.model.User;
import com.smartedu.repository.StudentRepository;
import com.smartedu.repository.UserRepository;
import com.smartedu.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StudentServiceImpl implements StudentService {

    @Autowired
    private StudentRepository studentRepository;
    
    @Autowired
    private UserRepository userRepository;

    @Override
    public Student saveStudent(Student student) {
        if (student.getUser() == null) {
            if (student.getUserId() != null) {
                userRepository.findById(student.getUserId()).ifPresent(student::setUser);
            } else if (student.getEmail() != null) {
                userRepository.findByEmail(student.getEmail()).ifPresent(student::setUser);
            } else if (student.getUsername() != null) {
                userRepository.findByUsername(student.getUsername()).ifPresent(student::setUser);
            }
        }
        return studentRepository.save(student);
    }

    @Override
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    @Override
    public Student getStudentById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));
    }

    @Override
    public Student getStudentByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        Optional<Student> studentOpt = studentRepository.findByUser_Id(userId);
        
        if (studentOpt.isEmpty() && user.getEmail() != null) {
            studentOpt = studentRepository.findByEmailIgnoreCase(user.getEmail());
        }
        
        if (studentOpt.isEmpty() && user.getUsername() != null) {
            studentOpt = studentRepository.findByUsernameIgnoreCase(user.getUsername());
        }

        // If matched by email/username but user_id was null, we can optionally link them
        if (studentOpt.isPresent() && studentOpt.get().getUser() == null) {
            Student student = studentOpt.get();
            student.setUser(user);
            studentRepository.save(student);
        }

        return studentOpt.orElseThrow(() -> new RuntimeException("Student profile not found for user id: " + userId));
    }

    @Override
    public Student updateStudent(Long id, Student studentDetails) {
        Student existingStudent = getStudentById(id);
        
        existingStudent.setFirstName(studentDetails.getFirstName());
        existingStudent.setLastName(studentDetails.getLastName());
        existingStudent.setDateOfBirth(studentDetails.getDateOfBirth());
        existingStudent.setEnrollmentDate(studentDetails.getEnrollmentDate());
        existingStudent.setPhone(studentDetails.getPhone());
        existingStudent.setAddress(studentDetails.getAddress());
        
        return studentRepository.save(existingStudent);
    }

    @Override
    public void deleteStudent(Long id) {
        studentRepository.deleteById(id);
    }
}
