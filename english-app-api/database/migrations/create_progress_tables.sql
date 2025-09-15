-- Database schema for English App Progress System
-- Created: September 15, 2025

-- Table: courses (Gestión de cursos)
CREATE TABLE courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    level ENUM('A1', 'A2', 'B1', 'B2') NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    total_topics INT DEFAULT 20,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table: topics (Temas del curso)
CREATE TABLE topics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT,
    topic_index INT NOT NULL, -- 0-19 para cada curso
    title VARCHAR(255) NOT NULL,
    objective TEXT,
    keywords JSON,
    examples JSON,
    learning_outcome TEXT,
    skills_covered JSON,
    tags JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_course_topic (course_id, topic_index)
);

-- Table: lessons (Lecciones/contenido JSON)
CREATE TABLE lessons (
    id INT PRIMARY KEY AUTO_INCREMENT,
    topic_id INT,
    lesson_index INT NOT NULL, -- Para ordenar las lecciones dentro del topic
    content JSON NOT NULL, -- Todo el contenido de la lección
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
    UNIQUE KEY unique_topic_lesson (topic_id, lesson_index)
);

-- Table: student_progress (Progreso del estudiante)
CREATE TABLE student_progress (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    course_id INT,
    topic_id INT,
    status ENUM('not_started', 'in_progress', 'completed') DEFAULT 'not_started',
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_topic (user_id, topic_id)
);

-- Table: practice_attempts (Intentos de práctica)
CREATE TABLE practice_attempts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    topic_id INT,
    practice_type ENUM('listening', 'speaking', 'fill_in_blank') NOT NULL,
    section_index INT NOT NULL, -- Índice de la sección dentro de la lección
    score DECIMAL(5,2) NOT NULL, -- Puntuación obtenida (0-100)
    total_questions INT NOT NULL,
    correct_answers INT NOT NULL,
    time_spent INT DEFAULT 0, -- Tiempo en segundos
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_practice (user_id, topic_id, practice_type, section_index)
);

-- Table: admin_content_uploads (Historial de cargas de contenido)
CREATE TABLE admin_content_uploads (
    id INT PRIMARY KEY AUTO_INCREMENT,
    admin_user_id INT,
    course_id INT,
    upload_type ENUM('full_course', 'single_topic', 'lesson_update') NOT NULL,
    file_name VARCHAR(255),
    status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    error_message TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Insert initial courses data
INSERT INTO courses (level, title, description) VALUES 
('A1', 'English A1 - Beginner', 'Basic English course for beginners focusing on fundamental communication skills'),
('A2', 'English A2 - Elementary', 'Elementary English course building on basic skills with more complex structures'),
('B1', 'English B1 - Intermediate', 'Intermediate English course for practical everyday communication'),
('B2', 'English B2 - Upper Intermediate', 'Upper intermediate English course for advanced workplace communication');

-- Create indexes for better performance
CREATE INDEX idx_student_progress_user ON student_progress(user_id);
CREATE INDEX idx_student_progress_course ON student_progress(course_id);
CREATE INDEX idx_practice_attempts_user ON practice_attempts(user_id);
CREATE INDEX idx_practice_attempts_topic ON practice_attempts(topic_id);
CREATE INDEX idx_topics_course ON topics(course_id);
CREATE INDEX idx_lessons_topic ON lessons(topic_id);