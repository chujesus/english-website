class AssessmentDTO {
    constructor(assessment = {}) {
        this.id = assessment.id;
        this.user_id = assessment.user_id;
        this.student_progress_id = assessment.student_progress_id;

        this.type = assessment.type;
        this.practice_answered = assessment.practice_answered 
            ? JSON.parse(assessment.practice_answered) 
            : [];

        this.score = assessment.score;
        this.feedback = assessment.feedback;

        this.created_at = assessment.created_at;
        this.updated_at = assessment.updated_at;
    }
}

module.exports = AssessmentDTO;
