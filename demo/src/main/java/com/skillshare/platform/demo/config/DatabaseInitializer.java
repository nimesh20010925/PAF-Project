package com.skillshare.platform.demo.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DatabaseInitializer {

    private final JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void initializeDatabase() {
        try {
            System.out.println("Checking and creating necessary database tables...");
            
            // Check if notifications table exists
            boolean notificationsExists = tableExists("notifications");
            if (!notificationsExists) {
                System.out.println("Creating notifications table...");
                jdbcTemplate.execute("""
                    CREATE TABLE IF NOT EXISTS notifications (
                        id BIGINT AUTO_INCREMENT PRIMARY KEY,
                        user_id BIGINT NOT NULL,
                        message VARCHAR(255) NOT NULL,
                        type VARCHAR(50) NOT NULL,
                        reference_id BIGINT,
                        `read` BOOLEAN DEFAULT FALSE,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users(id)
                    )
                """);
                System.out.println("Notifications table created successfully.");
            }
            
            // Check if learning_plans table exists
            boolean learningPlansExists = tableExists("learning_plans");
            if (!learningPlansExists) {
                System.out.println("Creating learning_plans table...");
                jdbcTemplate.execute("""
                    CREATE TABLE IF NOT EXISTS learning_plans (
                        id BIGINT AUTO_INCREMENT PRIMARY KEY,
                        user_id BIGINT NOT NULL,
                        title VARCHAR(255) NOT NULL,
                        description TEXT,
                        progress INT DEFAULT 0,
                        start_date DATETIME,
                        end_date DATETIME,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users(id)
                    )
                """);
                System.out.println("Learning plans table created successfully.");
            }
            
            // Check if learning_plan_topics table exists
            boolean learningPlanTopicsExists = tableExists("learning_plan_topics");
            if (!learningPlanTopicsExists) {
                System.out.println("Creating learning_plan_topics table...");
                jdbcTemplate.execute("""
                    CREATE TABLE IF NOT EXISTS learning_plan_topics (
                        id BIGINT AUTO_INCREMENT PRIMARY KEY,
                        learning_plan_id BIGINT NOT NULL,
                        name VARCHAR(255) NOT NULL,
                        description TEXT,
                        resources TEXT,
                        order_index INT DEFAULT 0,
                        completed BOOLEAN DEFAULT FALSE,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        FOREIGN KEY (learning_plan_id) REFERENCES learning_plans(id) ON DELETE CASCADE
                    )
                """);
                System.out.println("Learning plan topics table created successfully.");
            }
            
            System.out.println("Database initialization completed successfully.");
        } catch (Exception e) {
            System.err.println("Error initializing database: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    private boolean tableExists(String tableName) {
        try {
            Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?",
                Integer.class,
                tableName
            );
            return count != null && count > 0;
        } catch (Exception e) {
            System.err.println("Error checking if table exists: " + e.getMessage());
            return false;
        }
    }
}
