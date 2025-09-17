-- Script para insertar datos iniciales de Course Modules
-- Asegurar que la tabla courses tenga datos básicos

USE english_learning_db;

-- Insertar cursos iniciales si no existen
INSERT INTO courses (id, level, title, description, progress, state, created_at, updated_at) 
VALUES 
(1, 'A1', 'English A1 - Beginner', 'Basic English fundamentals for beginners', 12, 1, NOW(), NOW()),
(2, 'A2', 'English A2 - Elementary', 'Elementary English skills development', 14, 1, NOW(), NOW()),
(3, 'B1', 'English B1 - Intermediate', 'Intermediate English proficiency', 16, 1, NOW(), NOW()),
(4, 'B2', 'English B2 - Upper Intermediate', 'Advanced English communication skills', 18, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
    title = VALUES(title),
    description = VALUES(description),
    progress = VALUES(progress),
    updated_at = NOW();

-- Verificar que los datos se insertaron correctamente
SELECT * FROM courses ORDER BY 
    CASE level 
        WHEN 'A1' THEN 1 
        WHEN 'A2' THEN 2 
        WHEN 'B1' THEN 3 
        WHEN 'B2' THEN 4 
        ELSE 5 
    END;