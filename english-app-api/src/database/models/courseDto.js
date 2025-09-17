class CourseDto {
    constructor(course = {}) {
        this.id = course.id;
        this.level = course.level;
        this.title = course.title;
        this.description = course.description;
        this.progress = course.progress;
        this.state = course.state;
        this.created_at = course.created_at;
        this.updated_at = course.updated_at;
    }
}

module.exports = CourseDto;
