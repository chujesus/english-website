-- Migration: Create progress and content management tables
-- Date: 2025-09-15
-- Description: Tables for student progress tracking and content management

-- ========================================================
-- Table: users
-- ========================================================
CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    identification VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    name VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    first_name VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
    last_name VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
    password TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    email VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    phone VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
    password_token VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
    state INT NOT NULL,
    profile INT NOT NULL,
    url_image LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
    image_name VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
    token VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================
-- Table: courses
-- ========================================================
CREATE TABLE IF NOT EXISTS courses (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    level ENUM('A1', 'A2', 'B1', 'B2') NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    progress INT DEFAULT 0,
    state TINYINT(1) DEFAULT 1, -- 1=active, 0=inactive
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ========================================================
-- Table: student_progress
-- ========================================================
CREATE TABLE IF NOT EXISTS student_progress (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    course_id BIGINT UNSIGNED NOT NULL,
    topic_id VARCHAR(20) NULL,
    status ENUM('not_started', 'in_progress', 'completed') DEFAULT 'not_started',
    practice_types_completed JSON, -- aquí solo JSON
    progress_percentage INT DEFAULT 0,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_course (user_id, course_id)
);

-- ========================================================
-- Insert default courses
-- ========================================================
INSERT INTO courses (level, title, description, total_topics) VALUES
('A1', 'English A1', 'Beginner level English course focusing on basic communication skills', 0),
('A2', 'English A2', 'Elementary level English course for building fundamental language skills', 0),
('B1', 'English B1', 'Intermediate level English course for workplace and daily communication', 0),
('B2', 'English B2', 'Upper-intermediate level English course for advanced communication', 0);
