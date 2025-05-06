package com.skillshare.platform.demo.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.skillshare.platform.demo.model.Media;

import java.util.List;

@Repository
public interface MediaRepository extends JpaRepository<Media, Long> {
    
    List<Media> findByPostId(Long postId);
    
    void deleteByPostId(Long postId);
}
