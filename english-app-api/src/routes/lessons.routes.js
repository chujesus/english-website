const { Router } = require("express");
const { getLessonsByUserIdAndTopic } = require("../controllers/lesson");

const router = Router();

router.get("/:userId/:topicId", getLessonsByUserIdAndTopic);

module.exports = router;
