package com.skillshare.platform.demo.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.skillshare.platform.demo.dto.NotificationDTO;
import com.skillshare.platform.demo.model.Notification;
import com.skillshare.platform.demo.model.NotificationType;
import com.skillshare.platform.demo.repository.NotificationRepository;



@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

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
        Notification notification = Notification.builder()
                .user(null) // Will be set in the repository
                .message(message)
                .type(type)
                .referenceId(referenceId)
                .read(false)
                .build();

        Notification savedNotification = notificationRepository.save(notification);
        return NotificationDTO.fromNotification(savedNotification);
    }
}
