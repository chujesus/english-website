const { Router } = require('express');
const { check } = require('express-validator');
const { fieldsValidates } = require('../middlewares/fields-validates');
const { 
    submitPracticeAttempt, 
    getPracticeHistory, 
    canAttemptPractice, 
    calculateTopicScore 
} = require('../controllers/practice');

const router = Router();

/**
 * @route   POST /practice/submit
 * @desc    Submit a practice attempt
 * @access  Private
 */
router.post('/submit', [
    check('user_id', 'User ID is required').isNumeric(),
    check('topic_id', 'Topic ID is required').isNumeric(),
    check('practice_type', 'Practice type is required').isIn(['listening', 'speaking', 'fill_in_blank']),
    check('section_index', 'Section index is required').isNumeric(),
    check('total_questions', 'Total questions is required').isNumeric(),
    check('correct_answers', 'Correct answers is required').isNumeric(),
    fieldsValidates
], submitPracticeAttempt);

/**
 * @route   GET /practice/history/:userId/:topicId
 * @desc    Get practice history for a student and topic
 * @access  Private
 */
router.get('/history/:userId/:topicId', [
    check('userId', 'User ID is required').isNumeric(),
    check('topicId', 'Topic ID is required').isNumeric(),
    fieldsValidates
], getPracticeHistory);

/**
 * @route   GET /practice/can-attempt/:userId/:topicId/:practiceType/:sectionIndex
 * @desc    Check if student can attempt a specific practice
 * @access  Private
 */
router.get('/can-attempt/:userId/:topicId/:practiceType/:sectionIndex', [
    check('userId', 'User ID is required').isNumeric(),
    check('topicId', 'Topic ID is required').isNumeric(),
    check('practiceType', 'Practice type is required').isIn(['listening', 'speaking', 'fill_in_blank']),
    check('sectionIndex', 'Section index is required').isNumeric(),
    fieldsValidates
], canAttemptPractice);

/**
 * @route   GET /practice/topic-score/:userId/:topicId
 * @desc    Calculate topic score based on all completed practices
 * @access  Private
 */
router.get('/topic-score/:userId/:topicId', [
    check('userId', 'User ID is required').isNumeric(),
    check('topicId', 'Topic ID is required').isNumeric(),
    fieldsValidates
], calculateTopicScore);

module.exports = router;