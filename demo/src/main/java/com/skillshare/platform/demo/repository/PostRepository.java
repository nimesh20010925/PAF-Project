package com.skillshare.platform.demo.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.skillshare.platform.demo.model.Post;
import com.skillshare.platform.demo.model.PostType;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    
    Page<Post> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    Page<Post> findByTypeOrderByCreatedAtDesc(PostType type, Pageable pageable);
    
    @Query("SELECT p FROM Post p WHERE p.user.id IN " +
            "(SELECT f.id FROM User u JOIN u.following f WHERE u.id = :userId) " +
            "ORDER BY p.createdAt DESC")
    Page<Post> findFeedPostsByUserId(Long userId, Pageable pageable);
    
    @Query("SELECT p FROM Post p WHERE p.content LIKE %:query% ORDER BY p.createdAt DESC")
    Page<Post> searchPosts(String query, Pageable pageable);
}
