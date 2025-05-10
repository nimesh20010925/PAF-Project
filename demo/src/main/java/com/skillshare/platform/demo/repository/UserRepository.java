package com.skillshare.platform.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.skillshare.platform.demo.model.User;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.username LIKE %:query% OR u.name LIKE %:query%")
    List<User> searchUsers(String query);

    @Query(value = "SELECT u.* FROM users u " +
            "LEFT JOIN user_followers uf ON u.id = uf.followed_id " +
            "GROUP BY u.id " +
            "ORDER BY COUNT(uf.follower_id) DESC LIMIT :limit", nativeQuery = true)
    List<User> findTopUsersByFollowers(int limit);
}
