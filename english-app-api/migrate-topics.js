const { pool } = require("./src/database/db-connection/mySqlDbConnection");
const topicsA1 = require("../english-app/src/app/dashboard/courses/english_a1_topics.json");
const topicsA2 = require("../english-app/src/app/dashboard/courses/english_a2_topics.json");
const topicsB1 = require("../english-app/src/app/dashboard/courses/english_b1_topics.json");
const topicsB2 = require("../english-app/src/app/dashboard/courses/english_b2_topics.json");

async function seedTopics() {
  try {
    // Helper para insertar
    const insertTopics = async (topics, courseId) => {
      for (const topic of topics) {
        await pool.query(
          `
          INSERT INTO topics 
          (course_id, title, objective, examples, keywords, learning_outcome, cefr_level, skills_covered, tags)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
          [
            courseId,
            topic.title,
            topic.objective,
            JSON.stringify(topic.examples),
            JSON.stringify(topic.keywords),
            topic.learningOutcome,
            topic.cefrLevel,
            JSON.stringify(topic.skillsCovered),
            JSON.stringify(topic.tags),
          ]
        );
      }
    };

    // Insertar por curso
    await insertTopics(topicsA1, 1); // A1
    await insertTopics(topicsA2, 2); // A2
    await insertTopics(topicsB1, 3); // B1
    await insertTopics(topicsB2, 4); // B2

    process.exit(0);
  } catch (err) {
    console.error("❌ Error inserting topics:", err);
    process.exit(1);
  }
}

seedTopics();
