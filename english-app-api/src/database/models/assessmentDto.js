class AssessmentDTO {
  constructor(assessment = {}) {
    this.id = assessment.id;
    this.user_id = assessment.user_id;
    this.student_progress_id = assessment.student_progress_id;

    this.type = assessment.type;

    // Manejo seguro del campo JSON practice_answered
    this.practice_answered = this.parseJSONField(
      assessment.practice_answered,
      []
    );

    this.score = assessment.score;
    this.feedback = assessment.feedback;

    this.created_at = assessment.created_at;
    this.updated_at = assessment.updated_at;
  }

  parseJSONField(field, defaultValue = []) {
    if (!field) return defaultValue;
    if (typeof field === "object") return field;
    if (typeof field === "string") {
      try {
        return JSON.parse(field);
      } catch (error) {
        console.warn(`Error parsing JSON field: ${field}`, error);
        return defaultValue;
      }
    }
    return defaultValue;
  }
}

module.exports = AssessmentDTO;
