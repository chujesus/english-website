class TopicDto {
    constructor(topic = {}) {
        this.id = topic.id;
        this.course_id = topic.course_id;
        this.topic_index = topic.topic_index;
        this.title = topic.title;
        this.objective = topic.objective;
        this.keywords = topic.keywords;
        this.examples = topic.examples;
        this.learning_outcome = topic.learning_outcome;
        this.skills_covered = topic.skills_covered;
        this.tags = topic.tags;
        this.state = topic.state;
        this.created_at = topic.created_at;
        this.updated_at = topic.updated_at;
    }
}

module.exports = TopicDto;
