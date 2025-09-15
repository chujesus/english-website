class LessonDTO {
    constructor(lesson = {}) {
        this.id = lesson.id;
        this.topic_id = lesson.topic_id;
        this.lesson_index = lesson.lesson_index;
        this.content = lesson.content;
        this.is_active = lesson.is_active;
        this.created_at = lesson.created_at;
        this.updated_at = lesson.updated_at;
    }
}

module.exports = LessonDTO;