// seed-lessons.js
const { pool } = require("./src/database/db-connection/mySqlDbConnection");

// Importa tus archivos de lecciones (ejemplo: A1 lección 0)
const lessonsA1 = require("../english-app/src/assets/lessons-files/english-a1/english_a1_0.json");

// TODO: Cambiar topicId real de la BD según corresponda
const TOPIC_ID = 1;

async function seedLessons(topicId = TOPIC_ID) {
  try {
    for (const lesson of lessonsA1) {
      for (const section of lesson.sections) {
        await pool.query(
          `INSERT INTO lessons 
          (topic_id, title, objective, is_grammar, is_reading, is_speaking, is_listening, is_writing, 
           content, grammar, reading, speaking, listening, writing, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            topicId,
            section.title,
            section.objective,
            section.isGrammar ? 1 : 0,
            section.isReading ? 1 : 0,
            section.isSpeaking ? 1 : 0,
            section.isListening ? 1 : 0,
            section.isWriting ? 1 : 0,
            section.content || null, // 👈 content como LONGTEXT
            JSON.stringify(section.grammar || []),
            JSON.stringify(section.reading || {}),
            JSON.stringify(section.speaking || []),
            JSON.stringify(section.listening || []),
            JSON.stringify(section.writing || []), // 👈 aquí ya guardamos "writing"
          ]
        );
      }
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ Error inserting lessons:", err);
    process.exit(1);
  }
}

seedLessons();
