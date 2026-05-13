package com.smartedu.controller;

import com.smartedu.model.Role;
import com.smartedu.model.User;
import com.smartedu.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/students/unassigned")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<List<User>> getUnassignedStudents() {
        return ResponseEntity.ok(userRepository.findByRoleAndStudentProfileIsNull(Role.STUDENT));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER') or hasRole('STUDENT')")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        // We only allow updating username and email through this endpoint
        user.setUsername(userDetails.getUsername());
        user.setEmail(userDetails.getEmail());
        
        userRepository.save(user);

        return ResponseEntity.ok(user);
    }
}
