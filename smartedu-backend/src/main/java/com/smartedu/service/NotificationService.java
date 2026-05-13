package com.smartedu.service;

import com.smartedu.model.Notification;
import com.smartedu.model.User;
import com.smartedu.repository.NotificationRepository;
import com.smartedu.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    public void createNotification(User user, String title, String message) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .timestamp(LocalDateTime.now())
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }

    public void createNotificationForRole(com.smartedu.model.Role role, String title, String message) {
        List<User> users = userRepository.findAll(); // simplified
        for (User user : users) {
            if (user.getRole() == role) {
                createNotification(user, title, message);
            }
        }
    }

    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByTimestampDesc(userId);
    }

    public Notification markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + id));
        notification.setRead(true);
        return notificationRepository.save(notification);
    }
}
