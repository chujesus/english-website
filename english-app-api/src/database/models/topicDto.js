class TopicDTO {
    constructor(topic = {}) {
        this.id = topic.id;
        this.course_id = topic.course_id;
        this.title = topic.title;
        this.objective = topic.objective;
        this.examples = topic.examples ? JSON.parse(topic.examples) : [];
        this.keywords = topic.keywords ? JSON.parse(topic.keywords) : [];
        this.learning_outcome = topic.learning_outcome;
        this.cefr_level = topic.cefr_level;
        this.skills_covered = topic.skills_covered ? JSON.parse(topic.skills_covered) : [];
        this.tags = topic.tags ? JSON.parse(topic.tags) : [];
        this.created_at = topic.created_at;
        this.updated_at = topic.updated_at;
    }
}

module.exports = TopicDTO;
