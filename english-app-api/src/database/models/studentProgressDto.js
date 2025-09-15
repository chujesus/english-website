class StudentProgressDTO {
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
        this.created_at = progress.created_at;
        
        // Datos adicionales que pueden venir de JOINs
        this.course_title = progress.course_title;
        this.course_level = progress.course_level;
        this.topic_title = progress.topic_title;
        this.topic_index = progress.topic_index;
    }
}

module.exports = StudentProgressDTO;