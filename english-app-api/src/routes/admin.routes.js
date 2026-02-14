const express = require("express");
const router = express.Router();
const {
  getAllCoursesAdmin,
  createCourse,
  updateCourse,
  deleteCourse,
} = require("../controllers/adminCourse");
const {
  getTopicsByCourseAdmin,
  createTopic,
  updateTopic,
  deleteTopic,
} = require("../controllers/adminTopic");
const {
  getLessonsByTopicAdmin,
  createLesson,
  updateLesson,
  deleteLesson,
} = require("../controllers/adminLesson");

// Course routes
router.get("/courses", getAllCoursesAdmin);
router.post("/courses", createCourse);
router.put("/courses/:id", updateCourse);
router.delete("/courses/:id", deleteCourse);

// Topic routes
router.get("/courses/:courseId/topics", getTopicsByCourseAdmin);
router.post("/topics", createTopic);
router.put("/topics/:id", updateTopic);
router.delete("/topics/:id", deleteTopic);

// Lesson routes
router.get("/topics/:topicId/lessons", getLessonsByTopicAdmin);
router.post("/lessons", createLesson);
router.put("/lessons/:id", updateLesson);
router.delete("/lessons/:id", deleteLesson);

module.exports = router;
