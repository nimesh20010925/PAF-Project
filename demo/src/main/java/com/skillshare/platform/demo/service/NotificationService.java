package com.skillshare.platform.demo.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.skillshare.platform.demo.dto.NotificationDTO;
import com.skillshare.platform.demo.exception.ResourceNotFoundException;
import com.skillshare.platform.demo.model.Notification;
import com.skillshare.platform.demo.model.NotificationType;
import com.skillshare.platform.demo.model.User;
import com.skillshare.platform.demo.repository.NotificationRepository;
import com.skillshare.platform.demo.repository.UserRepository;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public Page<NotificationDTO> getUserNotifications(Long userId, Pageable pageable) {
        Page<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return notifications.map(NotificationDTO::fromNotification);
    }

    public long getUnreadNotificationsCount(Long userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    @Transactional
    public void markNotificationAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);
        });
    }

    @Transactional
    public void markAllNotificationsAsRead(Long userId) {
        notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, Pageable.unpaged())
                .forEach(notification -> {
                    notification.setRead(true);
                    notificationRepository.save(notification);
                });
    }

    @Transactional
    public NotificationDTO createNotification(Long userId, String message, NotificationType type, Long referenceId) {
        log.info("Creating notification for user {} with message: {}", userId, message);

        try {
            // Find the user first
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
            log.info("Found user: {}", user.getUsername());

            Notification notification = Notification.builder()
                    .user(user) // Set the user properly
                    .message(message)
                    .type(type)
                    .referenceId(referenceId)
                    .read(false)
                    .build();

            log.info("Saving notification to database");
            Notification savedNotification = notificationRepository.save(notification);
            log.info("Notification saved successfully with id: {}", savedNotification.getId());

            return NotificationDTO.fromNotification(savedNotification);
        } catch (Exception e) {
            log.error("Error creating notification: {}", e.getMessage(), e);
            throw e;
        }
    }
}
