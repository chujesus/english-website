class PracticeAttemptDTO {
    constructor(attempt = {}) {
        this.id = attempt.id;
        this.user_id = attempt.user_id;
        this.topic_id = attempt.topic_id;
        this.practice_type = attempt.practice_type;
        this.section_index = attempt.section_index;
        this.score = attempt.score;
        this.total_questions = attempt.total_questions;
        this.correct_answers = attempt.correct_answers;
        this.time_spent = attempt.time_spent;
        this.completed_at = attempt.completed_at;
        
        // Datos adicionales
        this.topic_title = attempt.topic_title;
        this.course_level = attempt.course_level;
    }
}

module.exports = PracticeAttemptDTO;