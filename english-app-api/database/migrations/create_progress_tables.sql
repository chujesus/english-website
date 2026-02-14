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
    starting_module ENUM('A1', 'A2', 'B1', 'B2') DEFAULT 'A1',
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ========================================================
-- Table: topics
-- ========================================================
CREATE TABLE IF NOT EXISTS topics (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    course_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    objective TEXT,
    examples JSON,          -- array de ejemplos
    keywords JSON,          -- array de palabras clave
    learning_outcome TEXT,
    cefr_level ENUM('A1', 'A2', 'B1', 'B2') NOT NULL,
    skills_covered JSON,    -- array de skills
    tags JSON,              -- array de etiquetas
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================
-- Table: lessons
-- ========================================================
CREATE TABLE IF NOT EXISTS lessons (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    topic_id BIGINT UNSIGNED NOT NULL,   -- relación con el tema
    title VARCHAR(255) NOT NULL,
    objective TEXT,

    -- Flags
    is_grammar TINYINT(1) DEFAULT 0,
    is_reading TINYINT(1) DEFAULT 0,
    is_speaking TINYINT(1) DEFAULT 0,
    is_listening TINYINT(1) DEFAULT 0,
    is_writing TINYINT(1) DEFAULT 0,

    -- Contenido en JSON (más flexible que desglosarlo en tablas)
    content LONGTEXT NULL,
    grammar JSON NULL,
    reading JSON NULL,
    speaking JSON NULL,
    listening JSON NULL,
    writing JSON NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================
-- Table: student_progress
-- ========================================================
CREATE TABLE IF NOT EXISTS student_progress (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,        -- estudiante
    course_id BIGINT UNSIGNED NOT NULL,      -- curso
    topic_id BIGINT UNSIGNED NOT NULL,       -- tema
    lesson_id BIGINT UNSIGNED NOT NULL,      -- lección
    
    is_completed TINYINT(1) DEFAULT 0,       -- completó la lección (0 = no, 1 = sí)
    progress_percent DECIMAL(5,2) DEFAULT 0, -- % de avance en la lección
    last_accessed TIMESTAMP NULL,            -- última vez que entró
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================
-- Table: assessments
-- ========================================================
CREATE TABLE IF NOT EXISTS assessments ( 
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,               -- estudiante
    student_progress_id BIGINT UNSIGNED NOT NULL,   -- relación con el progreso del estudiante

    type ENUM('grammar', 'reading', 'speaking', 'listening', 'writing') NOT NULL,
    practice_answered JSON NOT NULL,                -- array de preguntas en formato JSON
    score DECIMAL(5,2) DEFAULT 0.00,                -- puntaje obtenido
    feedback TEXT NULL,                             -- retroalimentación del instructor

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_progress_id) REFERENCES student_progress(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
