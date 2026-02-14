class CourseDTO {
  constructor(course = {}) {
    this.id = course.id;
    this.level = course.level;
    this.title = course.title;
    this.description = course.description;
    this.created_at = course.created_at;
    this.updated_at = course.updated_at;
    this.progress_percent = course.progress_percent || 0;
    this.status = course.status || "not_started";
    this.lastAccessed = course.lastAccessed || null;
  }
}

module.exports = CourseDTO;
