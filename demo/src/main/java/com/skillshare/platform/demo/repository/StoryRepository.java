package com.skillshare.platform.demo.repository;

import com.skillshare.platform.demo.model.Story;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StoryRepository extends JpaRepository<Story, Long> {

    @Query("SELECT s FROM Story s WHERE s.user.id IN " +
           "(SELECT f.id FROM User u JOIN u.following f WHERE u.id = :userId) " +
           "AND s.expiresAt > :now " +
           "ORDER BY s.createdAt DESC")
    List<Story> findStoriesFromFollowedUsers(Long userId, LocalDateTime now);

    List<Story> findByUserIdAndExpiresAtAfterOrderByCreatedAtDesc(Long userId, LocalDateTime expiresAt);

    List<Story> findByExpiresAtBefore(LocalDateTime expiresAt);

    Page<Story> findByExpiresAtAfter(LocalDateTime expiresAt, Pageable pageable);
}
