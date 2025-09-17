class StudentProgressDto {
    constructor(progress = {}) {
        this.id = progress.id;
        this.user_id = progress.user_id;
        this.course_id = progress.course_id;
        this.topic_id = progress.topic_id;
        this.status = progress.status;
        this.progress_percentage = progress.progress_percentage;
        this.started_at = progress.started_at;
        this.completed_at = progress.completed_at;
        this.last_accessed = progress.last_accessed;
        this.state = progress.state;
        this.created_at = progress.created_at;
        this.updated_at = progress.updated_at;
        
        // Additional computed fields
        this.topic_title = progress.topic_title;
        this.course_title = progress.course_title;
        this.course_level = progress.course_level;
    }
}

module.exports = StudentProgressDto;
