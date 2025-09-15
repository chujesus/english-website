class CourseDTO {
    constructor(course = {}) {
        this.id = course.id;
        this.level = course.level;
        this.title = course.title;
        this.description = course.description;
        this.total_topics = course.total_topics;
        this.is_active = course.is_active;
        this.created_at = course.created_at;
        this.updated_at = course.updated_at;
    }
}

module.exports = CourseDTO;