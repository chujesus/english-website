class StudentProgressDTO {
  constructor(progress = {}) {
    this.id = progress.id;
    this.user_id = progress.user_id;
    this.course_id = progress.course_id;
    this.topic_id = progress.topic_id;
    this.lesson_id = progress.lesson_id;

    this.is_completed = !!progress.is_completed;
    this.progress_percent = progress.progress_percent;
    this.last_accessed = progress.last_accessed;

    this.created_at = progress.created_at;
    this.updated_at = progress.updated_at;
  }
}

module.exports = StudentProgressDTO;
