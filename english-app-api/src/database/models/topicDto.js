class TopicDTO {
  constructor(topic = {}) {
    this.id = topic.id;
    this.course_id = topic.course_id;
    this.title = topic.title;
    this.objective = topic.objective;

    // Manejo seguro de campos JSON
    this.examples = this.parseJSONField(topic.examples, []);
    this.keywords = this.parseJSONField(topic.keywords, []);
    this.skills_covered = this.parseJSONField(topic.skills_covered, []);
    this.tags = this.parseJSONField(topic.tags, []);

    this.learning_outcome = topic.learning_outcome;
    this.cefr_level = topic.cefr_level;
    this.created_at = topic.created_at;
    this.updated_at = topic.updated_at;
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

module.exports = TopicDTO;
