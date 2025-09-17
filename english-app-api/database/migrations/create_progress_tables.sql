-- Migration: Create progress and content management tables
-- Date: 2025-09-15
-- Description: Tables for student progress tracking and content management

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
-- Table: topics
-- ========================================================
CREATE TABLE IF NOT EXISTS topics (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    course_id BIGINT UNSIGNED NOT NULL,
    topic_index INT NOT NULL, -- 0-19 for each course
    title VARCHAR(255) NOT NULL,
    objective TEXT,
    keywords JSON,
    examples JSON,
    learning_outcome TEXT,
    skills_covered JSON,
    tags JSON,
    state TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_course_topic (course_id, topic_index)
);

-- ========================================================
-- Table: lessons
-- ========================================================
CREATE TABLE IF NOT EXISTS lessons (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    topic_id BIGINT UNSIGNED NOT NULL,
    lesson_index INT NOT NULL,
    content JSON NOT NULL, -- Full lesson content
    state TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
    UNIQUE KEY unique_topic_lesson (topic_id, lesson_index)
);

-- ========================================================
-- Table: student_progress
-- ========================================================
CREATE TABLE IF NOT EXISTS student_progress (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    course_id BIGINT UNSIGNED NOT NULL,
    topic_id BIGINT UNSIGNED NOT NULL,
    status ENUM('not_started', 'in_progress', 'completed') DEFAULT 'not_started',
    progress_percentage INT DEFAULT 0,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    state TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_topic (user_id, topic_id)
);

-- ========================================================
-- Table: practice_attempts
-- ========================================================
CREATE TABLE IF NOT EXISTS practice_attempts (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    topic_id BIGINT UNSIGNED NOT NULL,
    practice_type ENUM('listening', 'speaking', 'fill_in_blank') NOT NULL,
    section_index INT NOT NULL, -- Section index within the lesson
    score DECIMAL(5,2) NOT NULL, -- Score obtained (0-100)
    total_questions INT NOT NULL,
    correct_answers INT NOT NULL,
    time_spent INT DEFAULT 0, -- Time in seconds
    answers JSON NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    state TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_practice (user_id, topic_id, practice_type, section_index)
);

-- ========================================================
-- Table: admin_content_uploads
-- ========================================================
CREATE TABLE IF NOT EXISTS admin_content_uploads (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    admin_user_id BIGINT UNSIGNED NOT NULL,
    course_id BIGINT UNSIGNED NULL,
    upload_type ENUM('full_course', 'single_topic', 'lesson_update') NOT NULL,
    file_name VARCHAR(255) NULL,
    status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    error_message TEXT NULL,
    state TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
);

-- ========================================================
-- Insert default courses
-- ========================================================
INSERT INTO courses (level, title, description, total_topics) VALUES
('A1', 'English A1', 'Beginner level English course focusing on basic communication skills', 0),
('A2', 'English A2', 'Elementary level English course for building fundamental language skills', 0),
('B1', 'English B1', 'Intermediate level English course for workplace and daily communication', 0),
('B2', 'English B2', 'Upper-intermediate level English course for advanced communication', 0);
