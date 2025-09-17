class PracticeAttemptDto {
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
        this.answers = attempt.answers;
        this.completed_at = attempt.completed_at;
        this.state = attempt.state;
        this.created_at = attempt.created_at;
        this.updated_at = attempt.updated_at;
        
        // Additional computed fields
        this.topic_title = attempt.topic_title;
        this.percentage = attempt.total_questions > 0 
            ? Math.round((attempt.correct_answers / attempt.total_questions) * 100) 
            : 0;
    }
}

module.exports = PracticeAttemptDto;
