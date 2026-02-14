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

    // content es LONGTEXT, los demás son JSON
    this.content = lesson.content || null;
    this.grammar = this.parseJSONField(lesson.grammar, null);
    this.reading = this.parseJSONField(lesson.reading, null);
    this.speaking = this.parseJSONField(lesson.speaking, null);
    this.listening = this.parseJSONField(lesson.listening, null);
    this.writing = this.parseJSONField(lesson.writing, null);

    this.created_at = lesson.created_at;
    this.updated_at = lesson.updated_at;
  }

  parseJSONField(field, defaultValue = null) {
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

module.exports = LessonDTO;
