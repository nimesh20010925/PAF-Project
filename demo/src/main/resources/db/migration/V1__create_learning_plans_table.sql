-- Check if learning_plans table exists and create it if it doesn't
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
);

-- Check if learning_plan_topics table exists and create it if it doesn't
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
);

-- Check if notifications table exists and create it if it doesn't
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    message VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    reference_id BIGINT,
    read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
