class LessonDto {
    constructor(lesson = {}) {
        this.id = lesson.id;
        this.topic_id = lesson.topic_id;
        this.lesson_index = lesson.lesson_index;
        this.content = lesson.content;
        this.state = lesson.state;
        this.created_at = lesson.created_at;
        this.updated_at = lesson.updated_at;
    }
}

module.exports = LessonDto;
