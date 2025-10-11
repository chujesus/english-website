class LessonDTO {
    constructor(lesson = {}) {
        this.id = lesson.id;
        this.topic_id = lesson.topic_id;
        this.title = lesson.title;
        this.objective = lesson.objective;

        this.is_grammar = !!lesson.is_grammar;
        this.is_reading = !!lesson.is_reading;
        this.is_speaking = !!lesson.is_speaking;
        this.is_listening = !!lesson.is_listening;
        this.is_writing = !!lesson.is_writing;

        this.grammar = lesson.grammar ? JSON.parse(lesson.grammar) : null;
        this.reading = lesson.reading ? JSON.parse(lesson.reading) : null;
        this.speaking = lesson.speaking ? JSON.parse(lesson.speaking) : null;
        this.listening = lesson.listening ? JSON.parse(lesson.listening) : null;
        this.writing = lesson.writing ? JSON.parse(lesson.writing) : null;

        this.created_at = lesson.created_at;
        this.updated_at = lesson.updated_at;
    }
}

module.exports = LessonDTO;
